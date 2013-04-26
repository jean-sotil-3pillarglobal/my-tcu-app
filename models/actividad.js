module.exports = function(mongoose){
	Articulo_Schema = mongoose.Schema({
		art_id:{type:String},
		art_nombre:{type:String, min:5, max:15, require:true},
		art_descripcion:{type:String, min:10, max:255, require:false},
		art_serie:Boolean,
		art_prestado:Boolean
	});

	Actividad_Schema = mongoose.Schema({
		act_nombre: {type:String, min:5, max:20, unique: true, require:true},
		act_desc : {type:String, min:5, max:20, require:true},
		act_duracion : {type:Number, require:true},
		articulos:[Articulo_Schema]
	});

	Actividad = mongoose.model('Actividad', Actividad_Schema);

	var agregarActividad = function(act_nombre, act_desc, act_duracion, callback){
		actividad = new Actividad({
			act_nombre:act_nombre,
			act_desc:act_desc,
			act_duracion:act_duracion
		});
		actividad.save(function(err){
			if(err){
				callback(false);
				console.log('No se agregró la actividad. error: ' + err);
			}else{
				console.log('Se agregró la actividad.');
				Actividad.findOne({act_nombre:act_nombre.trim()},function(err, actividad){
					if(!actividad){
						callback(null);
					}else{
						console.log('Se agregró la actividad id:'+actividad._id);
						callback(actividad);
					}
				});
			}
		});
	};

	var editarActividad = function(id,act_nombre, act_desc, act_duracion, callback){
		Actividad.update({_id:id},{$set:{
			act_nombre:act_nombre,
			act_desc:act_desc,
			act_duracion:act_duracion
		}}, {upsert:false}, function(err){
			if(err){
				callback(false);
				console.log('No se actualizó la actividad. error: ' + err);
			}else{
				callback(true);
				console.log('Se actualizó la actividad.');
			}
		});
	};

	var eliminarActividad = function(id, callback){
		Actividad.remove({_id:id}, function(err){
			if(err){
				callback(false);
				console.log('No se eliminó la actividad. error: ' + err);
			}else{
				callback(true);
				console.log('Se eliminó la actividad.');
			}
		});
	};

	var getActividad = function(id, callback){
		Actividad.findOne({_id:id}, function(err, actividad){
			if(!actividad){
				callback(null);
				console.log('No se encontró la actividad. error: ' + err);
			}else{
				callback(actividad);
				console.log('Se encontró la actividad. act_nombre:'+actividad.act_nombre);
			}
		});
	};


	var getActividades_act_nombre = function(act_nombre, callback){
		Actividad.find({act_nombre:{$regex:act_nombre, $options:'i'}}, function(err, actividades){
			if(!actividades){
				callback(null);
				console.log('No se encontró la actividad. error: ' + err);
			}else{
				callback(actividades);
			}
		});
	};

	var getActividades_act_desc = function(act_desc, callback){
		Actividad.find({act_desc:{$regex:act_desc, $options:'i'}}, function(err, actividades){
			if(!actividades){
				callback(null);
				console.log('No se encontró la actividad. error: ' + err);
			}else{
				callback(actividades);
			}
		});
	};

	var getActividadesAll = function(callback){
		Actividad.find(function(err, actividades){
			if(!actividades){
				callback(null);
				console.log('No se encontró actividades. error:' + err);
			}else{
				callback(actividades);
				console.log('Se encontró actividades');
			}
		});
	};

	var getArticulosAll = function(id, callback){
		Actividad.findOne({_id:id},function(err, actividad){
			if(!actividad){
				callback(null);
				console.log('No se encontró actividad. error:' + err);
				return;
			}else{
				callback(actividad.articulos);
				console.log('Se encontraró articulos.');
			}
		});

	};

	var almacenarArticulo = function(id, articulo, callback){

		var obj = {
			art_id:articulo._id,
			art_nombre:articulo.art_nombre,
			art_descripcion:articulo.art_descripcion,
			art_serie:articulo.art_serie,
			art_prestado:articulo.art_prestado
		};

		Actividad.update({_id:id}, {$push:{articulos:obj}},function(err){
			if(err){
				console.log('No se agrego articulo.');
				callback(false);
			}else{
				console.log('Se agregó articulo:'+ articulo.art_nombre);
				callback(true);
			}
		});
	};

	var extraerArticulo = function(id, art_id, callback){
		Actividad.update({_id:id},{$pull:{"articulos":{"_id":art_id.trim()}}},function(err){
			if(err){
				console.log('No se agrego articulo.'+ err);
				callback(false);
			}else{
				console.log('Se extrajo articulo.');
				callback(true);
			}
		});
	};


	return{
		Actividad : Actividad,
		agregarActividad:agregarActividad,
		editarActividad:editarActividad,
		eliminarActividad:eliminarActividad,
		getActividad:getActividad,
		getActividades_act_nombre:getActividades_act_nombre,
		getActividades_act_desc:getActividades_act_desc,
		getActividadesAll:getActividadesAll,
		getArticulosAll:getArticulosAll,
		almacenarArticulo:almacenarArticulo,
		extraerArticulo:extraerArticulo
	};
};