module.exports = function(mongoose){

	Actividad_Schema = mongoose.Schema({
		act_id:{type:String},
		act_nombre: {type:String, min:5, max:20, require:true},
		act_desc : {type:String, min:5, max:20, require:true},
		act_duracion : {type:Number, require:true},
		articulos:[]
	});

	Bitacora_Schema = mongoose.Schema({
		bit_nom_enc : {type:String, min:5, max:15, require:true},
		bit_desc : {type:String, min:5, max:300, require:true},
		bit_fecha : {type:String, require:true},
		bit_hora_inicio: {type:String, require:true},
		bit_hora_salida: {type:String, require:true},
		bit_direccion : {type: String, min:5, max:50, require:true},
		bit_cant_participantes: {type: Number, require:true},
		bit_cuantos_comparten: {type: Number, require:true},
		actividades:[Actividad_Schema],
		bit_extraido:Boolean
	});

	Bitacora = mongoose.model('Bitacora', Bitacora_Schema);

	var agregarBitacora = function(bit_nom_enc, bit_desc, bit_fecha, hra_inicio, hra_salida, dir, cant_part,cuantos_comparten, callback){
		bitacora = new Bitacora({
			bit_nom_enc : bit_nom_enc,
			bit_desc : bit_desc,
			bit_fecha : bit_fecha,
			bit_hora_inicio: hra_inicio,
			bit_hora_salida: hra_salida,
			bit_direccion : dir,
			bit_cant_participantes: cant_part,
			bit_cuantos_comparten:cuantos_comparten,
			bit_extraido:false
		});

		bitacora.save(function(err){
			if(err){
				callback(false);
				console.log('No se agregró la bitacora. error: ' + err);
			}else{
				console.log('Se agregró la bitacora.');
				Bitacora.findOne({
					'bit_nom_enc':bit_nom_enc,
					'bit_fecha':bit_fecha
				},function(err, bitacora){
					if(err){

					}else{
						//Devuelvo la bitacora.
						callback(bitacora);
						return;
					}
				});
			}
		});
	};

	var editarBitacora = function(id, bit_nom_enc, bit_desc, bit_fecha, hra_inicio, hra_salida, dir, cant_part,cuantos_comparten, callback){
		Bitacora.update({_id:id},{$set:{

			bit_nom_enc : bit_nom_enc,
			bit_desc : bit_desc,
			bit_fecha : bit_fecha,
			bit_hora_inicio: hra_inicio,
			bit_hora_salida: hra_salida,
			bit_direccion : dir,
			bit_cant_participantes: cant_part,
			bit_cuantos_comparten:cuantos_comparten

		}}, {upsert:false}, function(err){
			if(err){
				callback(false);
				console.log('No se actualizó la bitacora. error: ' + err);
			}else{
				callback(true);
				console.log('Se actualizó la bitacora.');
			}
		});
	};

	var eliminarBitacora = function(id, callback){
		Bitacora.remove({_id:id}, function(err){
			if(err){
				callback(false);
				console.log('No se eliminó la bitacora. error: ' + err);
				return;
			}else{
				callback(true);
				console.log('Se eliminó la bitacora.');
				return;
			}
		});
	};

	var getBitacora = function(id, callback){
		Bitacora.findOne({_id:id}, function(err, bitacora){
			if(!bitacora){
				callback(null);
				console.log('No se encontró la bitacora. error: ' + err);
				return;
			}else{
				console.log('Se encontró la bitacora. encargado:'+bitacora.bit_nom_enc);
				callback(bitacora);
				return;
			}
		});
	};

	var getBitacoras_bit_fecha = function(bit_fecha, callback){

		Bitacora.find({bit_fecha:bit_fecha}).sort({bit_fecha:'-1'}).exec(function(err,bitacoras){
			if(bitacoras.length==0){
				callback(null);
				console.log('No se encontró bitacoraes. error:' + err);
				return;
			}else{
				callback(bitacoras);
				console.log('Se encontró bitacoraes');
				return bitacoras;
			}
		});
	};

	var getBitacoras_hra_inicio = function(hra_inicio, callback){

		Bitacora.find({bit_hora_inicio:hra_inicio}).sort({bit_fecha:'-1'}).exec(function(err,bitacoras){
			if(!bitacoras){
				callback(null);
				console.log('No se encontró bitacoraes. error:' + err);
				return;
			}else{
				callback(bitacoras);
				console.log('Se encontró bitacoraes');
				return bitacoras;
			}
		});
	};
	var getBitacoras_bit_nom_enc = function(bit_nom_enc, callback){
						//Devuelve aproximaciones, equivalente a LIKE de SQL
		Bitacora.find({bit_nom_enc:{$regex:bit_nom_enc, $options:'i'}}).sort({bit_fecha:'-1'}).exec(function(err,bitacoras){
			if(bitacoras.length==0){
				callback(null);
				console.log('No se encontró bitacoraes. error:' + err);
				return;
			}else{
				callback(bitacoras);
				console.log('Se encontró bitacoraes');
				return bitacoras;
			}
		});
	};

	var getBitacorasAll = function(callback){
		Bitacora.find().sort({bit_fecha:'-1'}).exec(function(err,bitacoras){
			if(!bitacoras){
				callback(null);
				console.log('No se encontró bitacoraes. error:' + err);
				return;
			}else{
				callback(bitacoras);
				console.log('Se encontró bitacoraes');
				return bitacoras;
			}
		});
	};

	var getBitacorasAll_noExtraido = function(callback){
		Bitacora.find({bit_extraido:false}).sort({bit_fecha:'-1'}).exec(function(err,bitacoras){
			if(!bitacoras){
				callback(null);
				console.log('No se encontró bitacoraes. error:' + err);
				return;
			}else{
				callback(bitacoras);
				console.log('Se encontró bitacoraes');
				return bitacoras;
			}
		});
	};

	var getBitacorasAll = function(callback){
		Bitacora.find().sort({bit_fecha:'-1'}).exec(function(err,bitacoras){
			if(!bitacoras){
				callback(null);
				console.log('No se encontró bitacoraes. error:' + err);
				return;
			}else{
				callback(bitacoras);
				console.log('Se encontró bitacoraes');
				return bitacoras;
			}
		});
	};

	var getActividades = function(id, callback){
		Bitacora.findOne({_id:id},function(err, bitacora){
			if(!bitacora){
				callback(null);
				console.log('No se encontró bitacora. error:' + err);
				return;
			}else{
				callback(bitacora.actividades);
				console.log('Se encontraron activides, Nombre encargado:'+ bitacora.bit_nom_enc);
				return;
			}
		});

	};


	var almacenarActividad = function(id, actividad, callback){

		var obj = {
			act_id:actividad._id,
			act_nombre: actividad.act_nombre,
			act_desc :actividad.act_desc,
			act_duracion : actividad.act_duracion,
			articulos:actividad.articulos
		};

		Bitacora.update({_id:id},{$push:{actividades:obj}},function(err){
			if(err){
				//No se agrego actividad.
				console.log('No se agregó actividad. error:'+ err);
				callback(false);
			}else{
				//Se agrego actividad.
				console.log('Se agregó actividad.');
				callback(true);
			}
		});
	};

	var extraerActividad = function(id, act_id, callback){

		Bitacora.update({_id:id}, {$pull:{actividades:{act_id:act_id}}},function(err){
			if(err){
				//No se extrajo actividad.
				console.log('No se extrajó actividad.');
			}else{
				//Se extrajo actividad.
				console.log('Se extrajó actividad.');
			}
		});

		/*Bitacora.findOne({_id:id},function(err, bitacora){
			if(!bitacora){
				callback(false);
				console.log('No se encontró bitacora. error:' + err);
				return;
			}else{
				for(var i=0; i<bitacora.actividades.length-1; i++){
					var actividad = JSON.parse(bitacora.actividades[i]);
					if(actividad.nombre.trim() === nom_act.trim()){
						var nombre = actividad.nombre;
						bitacora.actividades.splice(i, i+1);
						console.log('Se eliminó actividad: '+ nombre);
						callback(true);
						return;
					}
				}
			}
		});*/
	};

	var extraerBitacora = function(id, callback){
		Bitacora.update({_id:id},{$set:{
			bit_extraido:true
		}},{upsert:false}, function(err){
			if(err){
				callback(false);
			}else{
				callback(true);
			}
		});
	};

	return{
		Bitacora:Bitacora,
		agregarBitacora:agregarBitacora,
		editarBitacora:editarBitacora,
		eliminarBitacora:eliminarBitacora,
		getBitacora:getBitacora,
		getBitacoras_bit_fecha:getBitacoras_bit_fecha,
		getBitacoras_hra_inicio:getBitacoras_hra_inicio,
		getBitacoras_bit_nom_enc:getBitacoras_bit_nom_enc,
		getBitacorasAll:getBitacorasAll,
		getBitacorasAll_noExtraido:getBitacorasAll_noExtraido,
		getActividades:getActividades,
		almacenarActividad:almacenarActividad,
		extraerActividad:extraerActividad,
		extraerBitacora:extraerBitacora
	};
};