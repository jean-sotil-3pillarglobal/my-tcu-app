module.exports = function(mongoose){
	Articulo_Schema = mongoose.Schema({
		art_nombre:{type:String, min:5, max:15, unique:true, require:true},
		art_descripcion:{type:String, min:10, max:255, require:false},
		art_serie:Boolean,
		art_prestado:Boolean
	});

	Inventario_Schema = mongoose.Schema({
		nombre:{type:String, require:true, unique:true, min:5, max:30},
		articulos_stock:[Articulo_Schema],
		articulos_prestados:[Articulo_Schema],
		cantidad_stock:{type:Number},
		cantidad_prestado: {type:Number}
	});

	var Inventario = mongoose.model('Inventario', Inventario_Schema);

	var agregarInventario = function(nombre, callback){
		inventario = new Inventario({
			nombre:nombre
		});
		inventario.save(function(err){
			if(err){
				callback(false);
				console.log('No se agregró el articulo al inventario. error: ' + err);
			}else{
				callback(false);
				console.log('Se agregró el articulo al inventario.');
			}
		});
	};

	var eliminarInventario = function(nombre, callback){
		//Si el inventario tiene articulos agregados NO ELIMINA.
		Inventario.findOne({nombre:nombre}, function(err, inventario){
			if(inventario.articulos_stock.length > 0 || inventario.articulos_prestados.length > 0){
				console.log('No se puede eliminar, contiene articulos');
				callback(false);
				return;
			}else{
				Inventario.remove({nombre:nombre},function(err){
					if(err){
						console.log("No se pudo eliminar el inventario.");
						callback(false);
					}else{
						console.log('Se eliminó el inventario: ' + inventario.nombre);
						callback(true);
					}
				});
			}
		});
	};

	var getInventario = function(nombre, callback){
		Inventario.findOne({nombre:nombre},function(err, inventario){
			if(err){
				callback(null);
				console.log('No se encontro el inventario. error: ' + err);
			}else{
				callback(inventario);
				console.log('Se encontro el inventario. nombre: ' + inventario.nombre);
			}
		});
	};
	var getInventariosAll = function(callback){
		Inventario.find(function(err, inventarios){
			if(err){
				callback(null);
				console.log('No se encontraron inventarios. error:  ' + err);
			}else{
				callback(inventarios);
				console.log('Se encontraron inventarios');
			}
		});
	};

	var getArticulosAll = function(nombre, callback){
		Inventario.findOne({nombre:nombre},function(err, inventario){
			if(err){
				callback(null);
				console.log('No se encontró inventario. error:' + err);
				return;
			}else{
				console.log('Se encontró inventario');
				callback(inventario.actividades);
			}
		});

	};

	var almacenarArticulo = function(nombre, articulo, callback){
		Inventario.findOne({nombre:nombre},function(err, inventario){
			if(err){
				callback(false);
				console.log('No se encontró inventario. error:' + err);
			}else{
				callback(true);
				console.log('Se encontró inventario.');
				inventario.articulos_stock.push(articulo);
				inventario.cantidad_stock = inventario.articulos_stock.length;
				console.log('Se agregö articulo. Articulos en stock:' + inventario.articulos_stock.length);
			}
		});
	};

	var extraerArticulo = function(nombre, serie, callback){
		Inventario.findOne({nombre:nombre},function(err, inventario){
			if(err){
				callback(false);
				console.log('No se encontró inventario. error:' + err);
				return;
			}else{
				console.log('Se encontró inventario');
				if(serie===""){
					for(var i=0; i<inventario.articulos_stock.length; i++){
						var articulo_sin_serie = JSON.parse(inventario.articulos_stock[i]);
						if(trim(articulo_sin_serie.serie)===""){
							inventario.articulos_stock.splice(i, i+1);
							console.log('Se extrajo articulo:' + articulo_sin_serie.nombre);
							inventario.cantidad_stock = inventario.articulos_stock.length;
							return;
						}
					}
				}else{
					for(var y=0; y<inventario.articulos_stock.length; y++){
						var articulo_con_serie = JSON.parse(inventario.articulos_stock[y]);
						if(trim(articulo_con_serie.serie) === trim(serie)){
							inventario.articulos_stock.splice(y, y+1);
							console.log('Se extrajo articulo con serie: '+ articulo_con_serie.serie);
							inventario.cantidad_stock = inventario.articulos_stock.length;
						}
					}
				}
			}
		});
	};



	var prestarArticulo = function(nombre, serie, callback){
		Inventario.findOne({nombre:nombre},function(err, inventario){
			if(err){
				callback(false);
				console.log('No se encontró inventario. error:' + err);
				return;
			}else{
				console.log('Se encontró inventario');
				if(serie===""){
					for(var i=0; i<inventario.articulos_stock.length; i++){
						var articulo_sin_serie = JSON.parse(inventario.articulos_stock[i]);
						if(trim(articulo_sin_serie.serie)===""){

							inventario.articulos_stock.splice(i, i+1);
							inventario.cantidad_stock = inventario.articulos_stock.length;
							inventario.articulos_prestados.push(articulo_sin_serie);
							inventario.cantidad_prestado = inventario.articulos_prestados.length;
							console.log('Se prestó articulo:' + articulo_sin_serie.nombre);
							callback(true);
							return;
						}
					}
				}else{
					for(var y=0; y<inventario.articulos_stock.length; y++){
						var articulo_con_serie = JSON.parse(inventario.articulos_stock[y]);
						if(trim(articulo_con_serie.serie) === trim(serie)){
							inventario.articulos_stock.splice(y, y+1);
							inventario.cantidad_stock = inventario.articulos_stock.length;
							inventario.articulos_prestados.push(articulo_con_serie);
							inventario.cantidad_prestado = inventario.articulos_prestados.length;
							console.log('Se prestó articulo con serie: '+ articulo_con_serie.serie);
							callback(true);
							return;
						}
					}
				}
			}
		});
	};

	var devolverArticulo = function(nombre, serie, callback){
		Inventario.findOne({nombre:nombre},function(err, inventario){
			if(err){
				callback(false);
				console.log('No se encontró inventario. error:' + err);
				return;
			}else{
				console.log('Se encontró inventario');
				if(serie===""){
					for(var i=0; i<inventario.articulos_prestados.length; i++){
						var articulo_sin_serie = JSON.parse(inventario.articulos_prestados[i]);
						if(trim(articulo_sin_serie.serie)===""){

							inventario.articulos_prestados.splice(i, i+1);
							inventario.cantidad_prestado = inventario.cantidad_prestado.length;
							inventario.articulos_stock.push(articulo_sin_serie);
							inventario.cantidad_stock = inventario.articulos_stock.length;
							console.log('Se devolvió articulo:' + articulo_sin_serie.nombre);
							callback(true);
							return;

						}
					}
				}else{
					for(var y=0; y<inventario.articulos_prestados.length; y++){
						var articulo_con_serie = JSON.parse(inventario.articulos_prestados[y]);
						if(trim(articulo_con_serie.serie) === trim(serie)){

							inventario.articulos_prestados.splice(y, y+1);
							inventario.cantidad_prestado = inventario.cantidad_prestado.length;
							inventario.articulos_stock.push(articulo_con_serie);
							inventario.cantidad_stock = inventario.articulos_stock.length;
							console.log('Se devolvió articulo con serie:' + articulo_con_serie.serie);
							callback(true);
							return;

						}
					}
				}
			}
		});
	};

	return{
		Inventario:Inventario,
		agregarInventario:agregarInventario,
		eliminarInventario:eliminarInventario,
		getInventario:getInventario,
		getInventariosAll:getInventariosAll,
		getArticulosAll:getArticulosAll,
		almacenarArticulo:almacenarArticulo,
		extraerArticulo:extraerArticulo,
		prestarArticulo:prestarArticulo,
		devolverArticulo:devolverArticulo
	};
};