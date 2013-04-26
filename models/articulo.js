module.exports = function(mongoose){

	Articulo_serie_Schema = mongoose.Schema({
		art_num_serie:{type:String},
		prestado:{type:Boolean, default:false}
	});

	Articulo_Schema = mongoose.Schema({
		art_nombre:{type:String, min:5, max:15, unique:true, require:true},
		art_descripcion:{type:String, min:10, max:255, require:false},
		art_serie:Boolean,
		art_prestado:Boolean,
		art_cant:{type:Number, default:0},
		art_cant_prestado:{type:Number, default:0},
		art_series:[Articulo_serie_Schema]
	});

	Articulo = mongoose.model('Articulo', Articulo_Schema);

	agregarArticulo = function(art_nombre, art_descripcion, art_serie, art_prestado, callback){
		if(art_serie=='true'){
			art_serie=1;
		}else{
			art_serie=0;
		}

		if(art_prestado == 'true'){
			art_prestado=1;
		}else{
			art_prestado=0;
		}

		articulo = new Articulo({
			art_nombre:art_nombre,
			art_descripcion:art_descripcion,
			art_serie:art_serie,
			art_prestado:art_prestado
		});
		articulo.save(function(err){
			if(err){
				callback(false);
				console.log('No se agregó el articulo, error: ' + err);
			}else{
				callback(true);
				console.log('Se agregó el articulo');
			}
		});
	};

	editarArticulo = function(id, art_nombre, art_descripcion, art_serie, art_prestado, callback){

		if(art_serie=='true'){
			art_serie=1;
		}else{
			art_serie=0;
		}

		if(art_prestado=='true'){
			art_prestado=1;
		}else{
			art_prestado=0;
		}

		Articulo.update({_id:id},
			{$set:{
				art_nombre:art_nombre,
				art_descripcion:art_descripcion,
				art_serie:art_serie,
				art_prestado:art_prestado
			}}, {upsert:false}, function(err){
			if(err){
				callback(false);
				console.log('No se actualizó el Articulo, error: ' + err);
			}else{
				callback(true);
				console.log('Se actualizó el articulo');
			}
		});
	};

	eliminarArticulo = function(id, callback){
		Articulo.remove({_id:id}, function(err){
			if(err){
				callback(false);
				console.log('No se eliminó el articulo, error: ' + err);
			}else{
				callback(true);
				console.log('Se eliminó el articulo');
			}
		});
	};

	getArticulo = function(id, callback){
		Articulo.findOne({_id:id.trim()}, function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró el articulo. error:' + err);
				return;
			}else{
				callback(articulo);
				console.log('Se encontró el articulo, art_nombre: ' + articulo.art_nombre);
			}
		});
	};

	getAllArticulos_no_serie = function(callback){
		Articulo.find({art_serie:false},function(err, articulos){
			if(!articulos){
				callback(null);
				console.log('No se encontró articulos. error:' + err);
			}else{
				callback(articulos);
				console.log('Se encontró articulos');
			}
		});
	};

	getAllArticulos_serie = function(callback){
		Articulo.find({art_serie:true},function(err, articulos){
			if(!articulos){
				callback(null);
				console.log('No se encontró articulos. error:' + err);
			}else{
				callback(articulos);
				console.log('Se encontró articulos');
			}
		});
	};

	getAllArticulos = function(callback){
		Articulo.find(function(err, articulos){
			if(!articulos){
				callback(null);
				console.log('No se encontró articulos. error:' + err);
			}else{
				callback(articulos);
				console.log('Se encontró articulos');
			}
		});
	};

	getArticulos_art_nombre_LIKE = function(art_nombre, callback){
		Articulo.find({art_nombre:{$regex:art_nombre, $options:'i'}},function(err, articulos){
			if(!articulos){
				callback(null);
				console.log('No se encontró articulos. error:' + err);
			}else{
				callback(articulos);
				console.log('Se encontró articulos');
			}
		});
	};

	getArticulo_nom = function(art_nombre, callback){
		Articulo.findOne({art_nombre:art_nombre},function(err, articulo){
			if(!articulo){
				callback(null);
			}else{
				callback(articulo);
			}
		});
	};

	getart_series = function(art_id, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró series. error:' + err);
				return;
			}else{
				var tam = articulo.art_series.length;

				nuevo_arr = [];
				for(var i=0; i<tam;i++){
					if(articulo.art_series[i].prestado==false){
						nuevo_arr.push(articulo.art_series[i]);
					}
				}
				callback(nuevo_arr);
				console.log('Se encontraró series.');
			}
		});
	};
	getart_series_prestado = function(art_id, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró series. error:' + err);
				return;
			}else{
				var tam = articulo.art_series.length;

				nuevo_arr = [];
				for(var i=0; i<tam;i++){
					if(articulo.art_series[i].prestado==true){
						nuevo_arr.push(articulo.art_series[i]);
					}
				}
				callback(nuevo_arr);
				console.log('Se encontraró series.');
			}
		});
	};


	getart_series_all = function(art_id, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró series. error:' + err);
				return;
			}else{
				callback(articulo.art_series);
				console.log('Se encontraró series.');
			}
		});
	};

	prestar_articulo = function(art_id, serie, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró articulo. error:' + err);
				return;
			}else{
				var arr = articulo.art_series;
				var arr_prestado = [];
				isTrue=false;
				for(var i=0; i<arr.length;i++){
					if(arr[i].art_num_serie == serie.trim()){
						arr[i].prestado = true;
						isTrue=true;
					}
				}

				if(isTrue){
					//SE encontró
					articulo.art_series = arr;
					articulo.art_cant = articulo.art_cant - 1;
					articulo.art_cant_prestado = articulo.art_cant_prestado + 1;

					articulo.save(function(err){
						if(err){
							callback(false);
							console.log('No se presto serie:'+serie);
						}else{
							callback(true);
							console.log('Se presto serie: '+serie);
						}
					});
				}else{
					//NO SE encontró
					console.log('Se encontró serie: '+serie);
					callback(false);
				}

			}
		});
	};

	devolver_articulo = function(art_id, serie, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró articulo. error:' + err);
				return;
			}else{
				var arr = articulo.art_series;
				var arr_prestado = [];
				isTrue=false;
				for(var i=0; i<arr.length;i++){
					if(arr[i].art_num_serie == serie.trim()){
						arr[i].prestado = false;
						isTrue=true;
					}
				}

				if(isTrue){
					//SE encontró
					articulo.art_series = arr;
					articulo.art_cant = articulo.art_cant + 1;
					articulo.art_cant_prestado = articulo.art_cant_prestado - 1;

					articulo.save(function(err){
						if(err){
							callback(false);
							console.log('No se devolvió serie:'+serie);
						}else{
							callback(true);
							console.log('Se devolvió serie: '+serie);
						}
					});
				}else{
					//NO SE encontró
					console.log('Se encontró serie: '+serie);
					callback(false);
				}

			}
		});
	};


	almacenarArticulo  = function(art_id, x, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró articulo. error:' + err);
				return;
			}else{
				//TIENE SERIE
				if(articulo.art_serie){
					arrjson = [];
					for(var i=0; i<x.length;i++){
						obj ={
							art_num_serie:x[i],
							prestado:false
						};
						Articulo.update({_id:art_id}, {$push:{art_series:obj}},function(err){
							if(err){
								console.log('No se agregó serie: '+ obj.art_num_serie);
								callback(false);
							}else{
								console.log('Se agregó serie: '+ obj.art_num_serie);
							}
						});
					}

					console.log('cantidad actual:'+articulo.art_cant);
					console.log('cantidad:'+ x.length);

					articulo.art_cant = articulo.art_cant + x.length;
					articulo.save(function(err){
					if(err){
							console.log('No se agregaron: '+ x.length + ' unidades.');
							callback(false);
						}else{
							console.log('Se agregó serie: '+ x.length + ' unidades');
							callback(true);
						}
				});


				}else{

					articulo.art_cant = parseInt(articulo.art_cant) + parseInt(x);
					articulo.save(function(err){
						if(err){
								console.log('No se agregaron: '+ x + ' unidades.');
								callback(false);
							}else{
								console.log('Se agregó serie: '+ x + ' unidades');
								callback(true);
							}
					});
				}
			}
		});
	};

	extraerArticulo  = function(art_id, x, callback){
		Articulo.findOne({_id:art_id},function(err, articulo){
			if(!articulo){
				callback(null);
				console.log('No se encontró articulo. error:' + err);
				return;
			}else{
				//TIENE SERIE
				if(articulo.art_serie){
					Articulo.update({_id:art_id},{$pull:{art_series:{art_num_serie:x}}},function(err){
						if(err){
							callback(false);
							console.log('No se extrajó la serie: ' + x);
						}else{
							callback(true);
							console.log('Se extrajó la serie: ' + x);
							articulo.art_cant = articulo.art_cant - 1;
							articulo.save(function(err){
							if(err){
									console.log('No se extrajo');
									callback(false);
								}else{
									console.log('Se extrajo serie: '+ x);
									callback(true);
								}
							});
						}
					});
				}else{
					//SI EXISTE CANTIDAD O ES MAYOR
					if(articulo.art_cant>=x){
						//EXTRAER
						articulo.art_cant = articulo.art_cant - x;
						articulo.save(function(err){
						if(err){
								console.log('No se extrajeron: '+ x + ' unidades.');
								callback(false);
							}else{
								console.log('Se extrajeron: '+ x + ' unidades');
								callback(true);
							}
						});
					}else{
						console.log('No se extrajeron: '+ x + ' unidades. Cantidad insuficiente en inventario.');
						callback(false);
					}

				}
			}
		});
	};

	return{
		Articulo:Articulo,
		agregarArticulo:agregarArticulo,
		editarArticulo:editarArticulo,
		eliminarArticulo:eliminarArticulo,
		getArticulo: getArticulo,
		getAllArticulos: getAllArticulos,
		getAllArticulos_no_serie:getAllArticulos_no_serie,
		getArticulos_art_nombre_LIKE:getArticulos_art_nombre_LIKE,
		getArticulo_nom:getArticulo_nom,
		getart_series:getart_series,
		getart_series_prestado:getart_series_prestado,
		getart_series_all:getart_series_all,
		prestar_articulo:prestar_articulo,
		devolver_articulo:devolver_articulo,
		almacenarArticulo:almacenarArticulo,
		extraerArticulo:extraerArticulo
	};

};