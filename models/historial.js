module.exports = function(mongoose){

	tiempo = new Date();
	var historial_Schema = mongoose.Schema({
		nombre:{type:String, require:true},
		fecha: {type: String},
		hora: {type:String},
		mensaje: {type:String, require:true}
	});

	var Historial = mongoose.model('Historial', historial_Schema);

	var agregarRegistro = function(nombre, mensaje, callback){
		var a, m, d, h, min;
		tiempo = new Date();
		a = tiempo.getFullYear();
		m = tiempo.getMonth() + 1;
		d = tiempo.getDate();
		h = tiempo.getHours();
		min = tiempo.getMinutes();

		console.log(a+"-"+m+"-"+d+" "+h+":"+min);
		fec=parseInt(a)+"-"+parseInt(m)+"-"+parseInt(d);
		nuevo = new Historial({
			nombre:nombre,
			fecha:fec,
			hora: h+":"+min,
			mensaje:mensaje
		});
		nuevo.save(function(err){
			if(err){
				callback(false);
				console.log('No se pudo agregar registro.');
				return;
			}else{
				callback(true);
				console.log('Se agrego un nuevo registro.');
			}
		});
	};

	var getRegistros_nombre = function(nombre, callback){

		var q = Historial.find({nombre:{$regex:nombre, $options:'i'}}).sort({fecha:'-1'});
		q.execFind(function(err, registros) {
			// `posts` will be of length 20
			if(!registros){
				callback(null);
				console.log('No se encontraron registros.');
				return;
			}else{
				callback(registros);
				console.log('Se encontraron registros.');
				return;
			}
		});
	};

	var getRegistros_fecha = function(fecha, callback){

		Historial.find({fecha:{$regex:fecha, $options:'i'}}).sort({hora:'-1'}).exec(function(err,registros){
			if(!registros){
				callback(null);
				console.log('No se encontraron registros.');
				return;
			}else{
				callback(registros);
				console.log('Se encontraron registros.');
				return;
			}
		});
	};

	var getRegistros_descripcion = function(desc, callback){

		var q = Historial.find({mensaje:{$regex:desc, $options:'i'}}).sort({fecha:'-1'});
		q.execFind(function(err, registros) {
			// `posts` will be of length 20
			if(!registros){
				callback(null);
				console.log('No se encontraron registros.');
				return;
			}else{
				callback(registros);
				console.log('Se encontraron registros.');
				return;
			}
		});

	};

	var getRegistrosAll = function(callback){

		var q = Historial.find().sort({fecha:'-1'});
		q.execFind(function(err, registros) {
			// `posts` will be of length 20
			if(!registros){
				callback(null);
				console.log('No se encontraron registros.');
				return;
			}else{
				callback(registros);
				console.log('Se encontraron registros.');
				return;
			}
		});

	};


	return{
		Historial:Historial,
		agregarRegistro:agregarRegistro,
		getRegistros_nombre:getRegistros_nombre,
		getRegistros_fecha:getRegistros_fecha,
		getRegistros_descripcion:getRegistros_descripcion,
		getRegistrosAll:getRegistrosAll
	};

};