module.exports = function(mongoose){

	var Cliente_Schema = mongoose.Schema({
		cli_ced:{type:String, unique:true, require:true},
		cli_nombre:{type:String, require:true, min:4, max:15},
		cli_ape_1: {type:String, require:true, min:4, max:15},
		cli_ape_2: {type:String, require:true, min:4, max:15},
		cli_nom_emp:{type:String, require:true, min:4, max:40},
		cli_direccion:{type:String, require:true, min:10, max:300},
		cli_telefono: {type:String, min:8,max:15},
		cli_mail: {type:String, unique:true, require:true, max:45}
	});
	var Cliente = mongoose.model('Cliente',Cliente_Schema);

	var agregarCliente = function(cli_ced, cli_nombre, cli_ape_1, cli_ape_2, cli_nom_emp, cli_direccion, cli_telefono, cli_mail, callback){
		var cliente = new Cliente({
			cli_ced:cli_ced,
			cli_nombre:cli_nombre,
			cli_ape_1:cli_ape_1,
			cli_ape_2:cli_ape_2,
			cli_nom_emp:cli_nom_emp,
			cli_direccion:cli_direccion,
			cli_telefono:cli_telefono,
			cli_mail:cli_mail
		});
		cliente.save(function(err){
			if(err){
				callback(false);
				console.log('No se agregó el cliente. error:'+err);
			}else{
				callback(true);
				console.log('Se agregó un cliente.');
			}
		});
	};

	var editarCliente = function(id, cli_ced, cli_nombre, cli_ape_1, cli_ape_2, cli_nom_emp, cli_direccion, cli_telefono, cli_mail, callback){

		Cliente.update({_id:id},{$set:{
			cli_nombre:cli_nombre,
			cli_ape_1:cli_ape_1,
			cli_ape_2:cli_ape_2,
			cli_nom_emp:cli_nom_emp,
			cli_direccion:cli_direccion,
			cli_telefono:cli_telefono,
			cli_mail:cli_mail
			//sino encuentra, agrega nuevo registro:false
		}}, {upsert:false}, function(err){
			if(err){
				callback(false);
				console.log('No se actualizó el cliente. error:'+err);
			}else{
				callback(true);
				console.log('Se actualizó el cliente');
			}
		});
	};

	var eliminarCliente = function(id, callback){
		Cliente.remove({_id:id},function(err){
			if(err){
				callback(false);
				console.log('No se eliminó el cliente. error:' + err);
			}else{
				callback(true);
				console.log('Se eliminó el cliente.');
			}
		});
	};

	var getCliente = function(id, callback){
		Cliente.findOne({_id:id.trim()}, function(err, cliente){
			if(!cliente){
				callback(null);
				console.log('No se encontró el cliente. error:' + err);
				return;
			}else{
				callback(cliente);
				console.log('Se encontró cliente. Cédula: ' + cliente.cli_ced);
			}
		});
	};
	var getClientesAll = function(callback){
		Cliente.find(function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró clientes. error:' + err);
			}else{
				callback(clientes);
				console.log('Se encontró clientes');
			}
		});
	};
	getClientes_cli_nombre_LIKE = function(cli_nombre, callback){
		Cliente.find({cli_nombre:{$regex:cli_nombre, $options:'i'}},function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró clientes. error:' + err);
			}else{
				callback(clientes);
				console.log('Se encontró clientes');
			}
		});
	};
	getClientes_cli_cedula_LIKE = function(cli_cedula, callback){
		Cliente.find({cli_ced:{$regex:cli_cedula, $options:'i'}},function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró clientes. error:' + err);
			}else{
				callback(clientes);
				console.log('Se encontró clientes');
			}
		});
	};
	getClientes_cli_empresa_LIKE = function(cli_empresa, callback){
		Cliente.find({cli_nom_emp:{$regex:cli_empresa, $options:'i'}},function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró clientes. error:' + err);
			}else{
				callback(clientes);
				console.log('Se encontró clientes');
			}
		});
	};
	var getClientes_ced = function(ced, callback){
		Cliente.find({ced:{$regex:ced, $options:'i'}}, function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró el clientes. error:' + err);
				return;
			}else{
				callback(clientes);
				console.log('Se encontró clientes.');
				return;
			}
		});
	};

	var getCliente_nom = function(cli_nombre, callback){
		Cliente.findOne({cli_nombre:cli_nombre}, function(err, cliente){
			if(!cliente){
				callback(null);
				console.log('No se encontró el clientes. error:' + err);
			}else{
				callback(cliente);
				console.log('Se encontró clientes.');
			}
		});
	};

	var getClientes_ape_1 = function(ape_1, callback){
		Cliente.find({primero:{$regex:ape_1, $options:'i'}}, function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró el clientes. error:' + err);
				return;
			}else{
				callback(clientes);
				console.log('Se encontró clientes.');
				return;
			}
		});
	};

	var getClientes_nom_emp = function(nom_emp, callback){
		Cliente.find({nom_emp:{$regex:nom_emp, $options:'i'}}, function(err, clientes){
			if(!clientes){
				callback(null);
				console.log('No se encontró el clientes. error:' + err);
			}else{
				callback(clientes);
				console.log('Se encontró clientes.');
			}
		});
	};

	return {
		Cliente:Cliente,
		agregarCliente : agregarCliente,
		editarCliente : editarCliente,
		eliminarCliente : eliminarCliente,
		getCliente: getCliente,
		getClientesAll : getClientesAll,
		getClientes_ced:getClientes_ced,
		getCliente_nom:getCliente_nom,
		getClientes_ape_1:getClientes_ape_1,
		getClientes_nom_emp:getClientes_nom_emp,
		getClientes_cli_nombre_LIKE:getClientes_cli_nombre_LIKE,
		getClientes_cli_cedula_LIKE:getClientes_cli_cedula_LIKE,
		getClientes_cli_empresa_LIKE:getClientes_cli_empresa_LIKE
	};
};