
module.exports = function(mongoose){

	var nodemailer = require('nodemailer');
	var crypto = require('crypto');
	var Cuenta_Schema = mongoose.Schema({
		nombre:{type:String, require:true, min:4, max:15},
		apellido :{
			primero : {type:String, require:true, min:4, max:15},
			segundo : {type:String, require:true, min:4, max:15}
		},
		pass: {type:String, min:4, max:20},
		direccion:{type:String, require:true, min:10, max:300},
		telefono: {type:String, min:8,max:15},
		mail: {type:String, unique:true, require:true, max:45}
	});
	var Cuenta = mongoose.model('Cuenta',Cuenta_Schema);


	var registrar = function(nom, ape1, ape2, pass,dir, tel, mail, callback){
		var sha = crypto.createHash('sha256');
		sha.update(pass);
		var hashedPass = sha.digest('hex');
		var cuenta = new Cuenta({
			nombre:nom,
			apellido:{
				primero:ape1,
				segundo:ape2
			},
			pass:hashedPass,
			direccion:dir,
			telefono:tel,
			mail:mail
		});
		cuenta.save(function(err){
			if(err){
				callback(false);
			}else{
				callback(true);
				console.log("la Cuenta fue procesada.");
			}
		});

	};

	var actualizar = function(mail_actual, nom, ape1, ape2, dir, tel, mail, callback){
		Cuenta.update({mail:mail_actual},
			{$set:{
				nombre:nom,
				apellido:{primero:ape1,segundo:ape2},
				mail:mail,
				direccion:dir,
				telefono:tel}}, {upsert:false},function(err){
			if(err){
				callback(false);
				console.log("error: no se pudo actualizar los datos");
			}else{
				callback(true);
				console.log("Se procesó satisfactorio.");
			}
		});
	};

	var registroCallback = function(err){
		if(err)
		{
			return console.log('error: no se pudo crear.');
		}
		else{
			return console.log('el usuario fue creado.');
		}
	};

	var nuevoPass = function(id, nuevo_pass, callback){
		var sha = crypto.createHash('sha256');
		sha.update(nuevo_pass);
		var hashedPass = sha.digest('hex');

		Cuenta.update({_id:id},{$set:{pass:hashedPass}},{upsert:false},function nuevoPassCallback(err){
			if(err)
			{
				callback(false);
				console.log('error: no se pudo cambiar el password.');
			}
			else{
				callback(true);
				console.log('se ha modificado el password de la Cuenta: '+ id);
			}
		});
	};


	var olvPass = function(email, url_pass, callback){

		Cuenta.findOne({mail:email}, function(err, cuenta){
			if(err){
				callback(false);
				return;
			}else{

				var SMTPtransport = nodemailer.createTransport("SMTP", {
				service: 'Gmail', // use well known service
				auth: {
					user: "asccr.info@gmail.com",
					pass: "prueba123"
					}
				});
				console.log(cuenta.mail);
				url_pass+= '?cuenta='+cuenta._id;
				SMTPtransport.sendMail({
					to:cuenta.mail,
					subject:"recuperación de clave",
					text: "click aqui para recuperar su clave: " + url_pass
				},function(err){
					if(err){
						console.log("error: no se pudo enviar el correo.");
						callback(false);
					}else{
						console.log("el correo fue enviado.");
						callback(true);
					}
				});
			}
		});
	};

	var ingresar = function(email,pass,callback){
		var sha = crypto.createHash('sha256');
		sha.update(pass);
		var hashedPass = sha.digest('hex');
		Cuenta.findOne({pass:hashedPass, mail:email},function(err, cuenta){
			//return true is not null
			if(!cuenta){
				console.log('No se encontrö' + err);
				callback(null);
				return;
			}else{
				console.log('Se encontrö cuenta: '+ cuenta.mail);
				callback(cuenta);
			}
		});
	};

	var getCuenta_mail = function(mail, callback){
		Cuenta.findOne({mail:mail}, function(err, cuenta){
			if(!cuenta){
				console.log('No se encontro la cuenta.');
				callback(null);
			}else{
				console.log('Se encontro la cuenta _id:'+ cuenta._id);
				callback(cuenta);
			}
		});
	};

	var getCuentasAll = function(callback){
		Cuenta.find(function(err, cuentas){
			if(!cuentas){
				console.log('No se encontro cuentas.');
				callback(null);
			}else{
				console.log('Se encontro cuentas');
				callback(cuentas);
			}
		});
	};

	var getCuentas_email_LIKE = function(txtmail,callback){

		Cuenta.find({'mail':new RegExp(txtmail, "i")},function(err, cuentas){

			if(!cuentas){
				console.log('No se encontro cuentas.');
				callback(null);
			}else{
				console.log('Se encontro cuentas');
				callback(cuentas);

			}
		});
	};

	var getCuentas_nombre_LIKE = function(txtnom, callback){
		Cuenta.find({'nombre':new RegExp(txtnom, "i")},function(err,cuentas){
			if(!cuentas){
				console.log('No se encontro cuentas.');
				callback(null);
			}else{
				console.log('Se encontro cuentas');
				callback(cuentas);
			}
		});
	};

	return {
		ingresar:ingresar,
		registrar:registrar,
		nuevoPass:nuevoPass,
		olvPass:olvPass,
		Cuenta:Cuenta,
		actualizar:actualizar,
		getCuenta_mail:getCuenta_mail,
		getCuentasAll:getCuentasAll,
		getCuentas_email_LIKE:getCuentas_email_LIKE,
		getCuentas_nombre_LIKE:getCuentas_nombre_LIKE
	};
};

