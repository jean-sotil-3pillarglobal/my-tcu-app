

var express = require("express");
var app = express();
var MemoryStore = require('connect').session.MemoryStore;

/*-----------------------------------------------
-------------------------------------------------
CONFIG
/-----------------------------------------------
-------------------------------------------------*/

var mongoose = require('mongoose');

app.configure(function(){
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(express.limit('1mb'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: "password", store: new MemoryStore()}));
  mongoose.connect("mongodb://admin:admin@dharma.mongohq.com:10074/dbtcu_final");
});

app.get('/',function(req, res){
	res.render('index.jade', {layout:false});
});

//modelos
var Bitacora = require('./models/bitacora.js')(mongoose);
var Actividad = require('./models/actividad.js')(mongoose);
var Articulo = require('./models/articulo.js')(mongoose);
var Cuenta = require('./models/cuenta.js')(mongoose);
var Cliente = require('./models/cliente.js')(mongoose);
var Historial = require('./models/historial.js')(mongoose);


/*-----------------------------------------------
-------------------------------------------------
                 SECCION CUENTA
/-----------------------------------------------
-------------------------------------------------*/

//getUsuario()

app.get('/cuenta/autenticado',function(req,res){
	if(req.session.logeado){
		res.send(200);
	}else{
		//no ah sido autenticado (valor default)
		res.send(401);
	}
});


var validar = function(param1, param2){
	return param1 == param2;
};

//CrearUsuario()
app.post('/registrar',function(req, res){

	var nombre= req.param('nombre',null);
	var primero = req.param('primero',null);
	var segundo = req.param('segundo',null);
	var pass1 = req.param('pass1',null);
	var pass2 = req.param('pass2',null);
	var dir = req.param('direccion',null);
	var tel = req.param('telefono',null);
	var mail = req.param('mail',null);

	/*------------------
	VALIDAR
	-------------------*/

	if(nombre && primero && segundo && pass1 && pass2 && dir && tel && mail){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}
	var validar = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(!validar.test(mail)){
		obj = {
			isTrue : false,
			msg : "Formato de correo invalido."
		};
		return res.send(obj);
	}
	if(pass1 != pass2){
		obj = {
			isTrue : false,
			msg : "Las claves no coinciden."
		};
		return res.send(obj);
	}

	Cuenta.registrar(nombre, primero, segundo, pass1,dir, tel, mail, function(err){
			if(!err){
				obj = {
				isTrue : false,
				msg : "No se pudo agregar, el mail: "+mail+" actualmente esta registrado por otra persona."
			};
			return res.send(obj);
		}else{
			obj = {
				isTrue : true,
				msg : "Se agregó usuario. cuenta: " + mail
			};
			Historial.agregarRegistro(req.session.mail, "Agregó usuario con cuenta: "+ mail, function(err){
				if(!err){
					console.log('No se Agregó registro.');
				}
			});
			return res.send(obj);
		}
	});
});

//Ingresar()
app.post('/login', function(req, res){

	req.session.logeado = false;
	req.session.mail = "";
	var mail = req.param('mail','');
	var pass = req.param('pass','');

	if(mail === "" || pass === ""){
		res.send(400);
		console.log('Debe ingresar datos.');
		return;
	}

	Cuenta.ingresar(mail, pass, function(obj){
		if(obj === null){
			res.send(null);
			return;
		}else{

			req.session.logeado = true;
			req.session.mail = mail;
			Historial.agregarRegistro(mail, "Ingreso al sistema. ", function(err){
				if(!err){
					console.log('No se Agregó registro.');
				}
			});
				//cuenta
			//res.send(obj);
			res.send(obj);
		}

	});
});

app.post("/cuenta/me", function(req, res){
	var mail = req.session.mail;
	Cuenta.getCuenta_mail(mail, function(obj){
		if(obj){
			req.session.usu_actual = obj;
			res.send(obj);
		}else{
			res.send(404);
		}
	});
});

app.post("/cuenta/getCuentasAll", function(req, res){

		Cuenta.getCuentasAll(function(objs){
		if(objs){
			res.send(objs);
		}else{
			res.send(404);
		}
	});
});

app.post("/cuenta/getCuentas_val", function(req, res){
		var txt = req.param('txt','');
		var check = req.param('check','');

		if(check=='email'){
			Cuenta.getCuentas_email_LIKE(txt, function(cuentas){
				if(cuentas){
					res.send(cuentas);
				}else{
					res.send(404);
				}
			});
		}else{
			Cuenta.getCuentas_nombre_LIKE(txt, function(cuentas){
				if(cuentas){
					res.send(cuentas);
				}else{
					res.send(404);
				}
			});
		}

});


app.post("/cuenta/editar",function(req, res){
	var mail_actual = req.session.mail;
	var nombre = req.param('nombre', null);
	var ape_1 = req.param('ape_1', null);
	var ape_2 = req.param('ape_2', null);
	var mail = req.param('mail', null);
	var direccion = req.param('direccion', null);
	var telefono = req.param('telefono', null);

	/*-----------------
	VALIDAR
	------------------*/
	if(nombre && ape_1 && ape_2 && mail && direccion && telefono){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}
	var validar = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	if(!validar.test(mail)){
		obj = {
			isTrue : false,
			msg : "Formato de correo invalido."
		};
		return res.send(obj);
	}

	Cuenta.actualizar(mail_actual, nombre, ape_1, ape_2, direccion, telefono, mail, function(err){
		if(!err){
			obj = {
				isTrue : false,
				msg : "No se pudieron guardar los cambios."
			};
			return res.send(obj);
		}else{
			obj = {
				isTrue : true,
				msg : "Proceso exitoso."
			};

			Historial.agregarRegistro(req.session.mail, "Editó su información.", function(err){
				if(!err){
					console.log('No se Agregó registro.');
				}
			});
			return res.send(obj);
		}
	});

});

app.post("/cuenta/salir", function(req, res){

	Historial.agregarRegistro(req.session.mail, "Salió del sistema.", function(err){
		if(!err){
			console.log('No se Agregó registro.');
		}
	});
	req.session.logeado = false;
	req.session.mail = "";
	req.session.usu_actual = null;
	res.send(true);
});



//Olvide_Clave()
app.post('/olvide_pass', function(req,res){
	hostname = req.headers.host;
	url = 'http://' + hostname + '/resetearClave';
	mail = req.param('mail','');
	if(mail === ""){
		res.send(400);
		return;
	}

	Cuenta.olvPass(mail, url, function(success){
		if(success){
			res.send(200);
			console.log('Correo fue enviado al mail: ' + mail);
		}else{
			res.send(400);
			$('#error').show().empty().text('error: No se encontró este usuario.');
			return;
		}
	});
});

//Enviar_id_Clave()
app.get('/resetearClave', function(req, res){
	var _id = req.param('cuenta','');
	res.render('resetearClave.jade',{locals:{cuenta:_id}});

});

//Cambiar_Clave()
app.post('/resetearClave', function(req, res){
	var _id = req.param('_id','');
	var pass = req.param('pass','');
	console.log(_id +" "+pass);
	if(null !== _id || null !== pass){
		Cuenta.nuevoPass(_id, pass,function(err){
			if(!err){
				console.log("error: falló.");
			}else{
				res.render('resetearClaveExito.jade');
			}
		});
	}
});

/*------------------------------------------
--------------------------------------------
-----------------ARTICULO-------------------
--------------------------------------------
------------------------------------------*/

//Crear Articulo
app.post('/articulos/agregar',function(req,res){
	var nom = req.param('nom','');
	var desc = req.param('desc','');
	var t_serie = req.param('t_serie',false);
	var s_presta= req.param('s_presta',false);

	if(nom && desc){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}

	Articulo.agregarArticulo(nom, desc, t_serie, s_presta, function(data){
		if(!data){
			obj = {
				isTrue : false,
				msg : "No se agrego el articulo."
			};
			return res.send(obj);
		}else{

			Historial.agregarRegistro(req.session.mail, "Agregó el articulo: "+ nom, function(err){
				if(!err){
					console.log('No se Agregó registro.');
				}
			});

			Articulo.getArticulo_nom(nom, function(articulo){
				obj = {
				isTrue : true,
				msg : "Articulo: "+nom+" agregado.",
				articulo:articulo
				};
				return res.send(obj);
			});

		}
	});
});

//GET ALL ARTICULOS
app.post('/articulos/getAllArticulos', function(req, res){
	Articulo.getAllArticulos(function(articulos){
		if(!articulos){
			res.send(400);
		}else{
			res.send(articulos);
		}
	});
});

//GET ALL ARTICULOS NO SERIE
app.post('/articulos/getAllArticulos_no_serie', function(req, res){
	Articulo.getAllArticulos_no_serie(function(articulos){
		if(!articulos){
			res.send(400);
		}else{
			res.send(articulos);
		}
	});
});

//GET ALL ARTICULOS SERIE
app.post('/articulos/getAllArticulos_serie', function(req, res){
	Articulo.getAllArticulos_serie(function(articulos){
		if(!articulos){
			res.send(400);
		}else{
			res.send(articulos);
		}
	});
});

app.post('/articulos/editarArticulo', function(req, res){
	var id=req.param('id','');
	var nombre=req.param('nombre','');
	var desc=req.param('desc','');
	var t_serie=req.param('t_serie','');
	var s_presta=req.param('s_presta','');

	if(nombre && desc){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}

	Articulo.editarArticulo(id, nombre,desc,t_serie, s_presta, function(data){
		if(!data){
			obj = {
			isTrue : false,
			msg : "No se editó el articulo: "+ nombre +"."
		};
		return res.send(obj);
		}else{

		Articulo.getArticulo(id, function(articulo){
			Historial.agregarRegistro(req.session.mail, "Editó articulo: "+ articulo.art_nombre, function(err){
				if(!err){
					console.log('No se Agregó registro.');
				}
			});
		});
			obj = {
			isTrue : true,
			msg : "Se editó el articulo: "+ nombre +"."
		};
		return res.send(obj);
		}
	});
});

app.post('/articulos/eliminarArticulo', function(req, res){
	var id = req.param('id', '');

	Articulo.getArticulo(id, function(articulo){
			Articulo.eliminarArticulo(id, function(data){
			if(!data){
				res.send(false);
			}else{

				Historial.agregarRegistro(req.session.mail, "Eliminó artículo: "+ articulo.art_nombre, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
				res.send(true);
			}
		});
	});
});

app.post('/articulos/getArticulo', function(req, res){
	var id = req.param('id', '');
	Articulo.getArticulo(id, function(articulo){
		if(!articulo){
			res.send(null);
		}else{
			res.send(articulo);
		}
	});
});

app.post('/articulos/getArticuloNom', function(req, res){
	var txt = req.param('txt', '');
	Articulo.getArticulos_art_nombre_LIKE(txt, function(articulos){
		if(!articulos){
			res.send(null);
		}else{
			res.send(articulos);
		}
	});
});

//GET SERIES
app.post('/articulos/getart_series',function(req, res){
	id = req.param('id','');
	Articulo.getart_series(id, function(series){
		if(!series){
			res.send(false);
		}else{
			res.send(series);
		}
	});
});

//GET SERIES PRESTADOS
app.post('/articulos/getart_series_prestado',function(req, res){
	id = req.param('id','');
	Articulo.getart_series_prestado(id, function(series){
		if(!series){
			res.send(false);
		}else{
			res.send(series);
		}
	});
});

//GET SERIES ALL
app.post('/articulos/getart_series_all',function(req, res){
	id = req.param('id','');
	Articulo.getart_series_all(id, function(series){
		if(!series){
			res.send(false);
		}else{
			res.send(series);
		}
	});
});


//PRESTAR ARTICULO SERIE
app.post('/articulos/prestar_articulo',function(req, res){
	id = req.param('id','');
	serie = req.param('serie',null);

	if(serie ==null){
		obj = {
		isTrue : false,
		msg : "Seleccione un artículo."
		};

		res.send(obj);
		return;
	}
	console.log('id: '+id+' '+ ' serie: '+serie);
	Articulo.prestar_articulo(id, serie,function(data){
		if(!data){
			obj = {
			isTrue : false,
			msg : "No se prestó artículo: "+ serie +"."
		};
			res.send(obj);
		}else{
			obj = {
			isTrue : true,
			msg : "Se prestó el artículo: "+ serie +"."
		};
			Articulo.getArticulo(id, function(articulo){
				Historial.agregarRegistro(req.session.mail, "Articulo: "+ articulo.art_nombre+" se prestó serie: "+serie, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			res.send(obj);

		}
	});
});

//DEVOLVER SERIE
app.post('/articulos/devolver_articulo',function(req, res){
	id = req.param('id','');
	serie = req.param('serie',null);

	if(serie ==null){
			obj = {
			isTrue : false,
			msg : "Seleccione un artículo."
		};
		res.send(obj);
		return;
	}

	Articulo.devolver_articulo(id, serie,function(data){
		if(!data){
			obj = {
			isTrue : false,
			msg : "No se devolvió el artículo: "+ serie +"."
		};
			res.send(obj);
		}else{
			obj = {
			isTrue : true,
			msg : "Se devolvió el artículo: "+ serie +"."
		};

			Articulo.getArticulo(id, function(articulo){
				Historial.agregarRegistro(req.session.mail, "Articulo: "+ articulo.art_nombre+" se devolvió serie: "+serie, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			res.send(obj);
		}
	});
});

//ALMACENAR SERIE
app.post('/articulos/almacenarArticulo',function(req, res){
	id = req.param('id', '');
	x = req.param('x', '');

	Articulo.almacenarArticulo(id, x, function(data){
		if(!data){
			obj = {
			isTrue : false,
			msg : "No se almacenaron las unidades."
		};
			res.send(obj);
		}else{
			obj = {
			isTrue : true,
			msg : "Se almacenaron las unidades."
		};

			if( x instanceof Array){
				x= x.length;
			}

			Articulo.getArticulo(id, function(articulo){
				Historial.agregarRegistro(req.session.mail, "Articulo: "+ articulo.art_nombre+" se agregaron: "+x+" unidades.", function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			res.send(obj);
		}
	});
});

//EXTRAER ARTICULO
app.post('/articulos/extraerArticulo',function(req, res){
	id = req.param('id', '');
	x = req.param('x', '');

	Articulo.extraerArticulo(id, x, function(data){
		if(!data){
			obj = {
			isTrue : false,
			msg : "No se extrajeron las unidades."
		};
			res.send(obj);
		}else{
			obj = {
			isTrue : true,
			msg : "Se extrajeron las unidades."
		};
			if( x instanceof Array){
				x= x.length;
			}

			Articulo.getArticulo(id, function(articulo){
				Historial.agregarRegistro(req.session.mail, "Articulo: "+ articulo.art_nombre+" se extrajeron: "+x+" unidades.", function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			res.send(obj);
		}
	});
});

/*************************************
--------------------------------------
-------------ACTIVIDADES--------------
--------------------------------------
*************************************/

app.post('/actividades/agregarActividad',function(req, res){

	var nombre = req.param('nombre','');
	var desc = req.param('desc','');
	var duracion = req.param('duracion','');

	if(nombre&&desc&&duracion){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}
	if(Number(duracion)){}else{
		obj = {
			isTrue : false,
			msg : "Valor 'duración' debe ser numérico."
		};
		return res.send(obj);
	}

	Actividad.agregarActividad(nombre, desc, duracion, function(actividad){
		if(!actividad){

			obj = {
					isTrue : false,
					msg : "No se agregó actividad.",
					_id:null
				};
			res.send(obj);

		}else{

			Historial.agregarRegistro(req.session.mail, "Agregó actividad: " + nombre, function(err){
				if(!err){
					console.log('No se Agregó registro.');
				}
			});

				obj = {
				isTrue : true,
				msg : "Se agregó actividad: "+ nombre +".",
				_id:actividad._id
			};

			return res.send(obj);
		}
	});
});

//AGREGAR ARTICULO ACTIVIDAD
app.post('/actividades/almacenarArticulo', function(req, res){
	var id_actividad = req.param('id_actividad','');
	var id_articulo = req.param('id_articulo','');

	Articulo.getArticulo(id_articulo, function(articulo){
		if(!articulo){
			res.send(false);
		}else{
			Actividad.almacenarArticulo(id_actividad, articulo, function(data){
				if(!data){
					res.send(false);
				}else{

					Actividad.getActividad(id_actividad, function(act){
						Historial.agregarRegistro(req.session.mail, "Agregó articulo: " + articulo.art_nombre + " a actividad: "+act.act_nombre, function(err){
						if(!err){
								console.log('No se Agregó registro.');
							}
						});
					});

					return res.send(true);

				}
			});
		}
	});
});

//ELIMINAR ARTICULO ACTIVIDAD
app.post('/actividades/eliminarArticulo',function(req, res){
	var id_act=req.param('id_act',null),
		id_art=req.param('id_art',null);

		Actividad.getActividad(id_act, function(actividad){
				Actividad.extraerArticulo(id_act, id_art, function(data){
					if(!data){
							obj = {
							isTrue : false,
							msg : "Error al extraer el articulo."
						};
						return res.send(obj);
					}else{

						Historial.agregarRegistro(req.session.mail, "Eliminó articulo de actividad: "+actividad.art_nombre, function(err){
						if(!err){
								console.log('No se Agregó registro.');
							}
						});

						obj = {
							isTrue : true,
							msg : "Se extrajó el articulo."
						};
						return res.send(obj);
					}
				});
		});
});


//EDITAR ACTIVIDAD
app.post('/actividades/editarActividad', function(req, res){
	var id = req.param('id',null);
	var nombre = req.param('nom',null);
	var desc = req.param('desc',null);
	var duracion = req.param('dur',0);

	if(id&&nombre&&desc&&duracion){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}
	if(Number(duracion)){}else{
		obj = {
			isTrue : false,
			msg : "Valor 'duración' debe ser numérico."
		};
		return res.send(obj);
	}

	Actividad.editarActividad(id, nombre, desc, duracion, function(data){
		if(!data){
			obj = {
				isTrue : false,
				msg : "No se editó la actividad: "+nombre
			};
			return res.send(obj);
		}else{

			Actividad.getActividad(id, function(actividad){
				Historial.agregarRegistro(req.session.mail, "Editó actividad: " + actividad.act_nombre, function(err){
				if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});

			obj = {
				isTrue : true,
				msg : "Se editó la actividad: "+nombre
			};
			return res.send(obj);
		}
	});
});


//ELIMINAR ACTIVIDAD
app.post('/actividades/eliminarActividad',function(req, res){
	var id = req.param('id','');
	Actividad.getActividad(id, function(act){
		Actividad.eliminarActividad(id, function(data){
			if(!data){
				return res.send(false);
			}else{

				Historial.agregarRegistro(req.session.mail, "Eliminó actividad: " + act.act_nombre, function(err){
				if(!err){
						console.log('No se Agregó registro.');
					}
				});
				return res.send(true);
			}
		});

	});
});

//GET ACTIVIDAD ALL
app.post('/actividades/getActividadesAll',function(req, res){
	Actividad.getActividadesAll(function(actividades){
		return res.send(actividades);
	});
});


//GET ACTIVIDAD ID
app.post('/actividades/getActividad',function(req, res){
	var id = req.param('id','');
	Actividad.getActividad(id, function(actividad){
		if(!actividad){}else{
			return res.send(actividad);
		}
	});
});

//GET ACTIVIDAD LIKE NOMBRE
app.post('/actividades/getActividad_Nom',function(req, res){
	var nom = req.param('nom','');
	Actividad.getActividades_act_nombre(nom, function(actividades){
		if(!actividades){}else{
			return res.send(actividades);
		}
	});
});

//GET ACTIVIDAD LIKE DUR
app.post('/actividades/getActividad_Desc',function(req, res){
	var desc = req.param('desc','');
	Actividad.getActividades_act_desc(desc, function(actividades){
		if(!actividades){}else{
			return res.send(actividades);
		}
	});
});

//GET ARTICULOS ACTIVIDAD
app.post('/actividades/getArticulos',function(req,res){
	var id = req.param('id',null);
	Actividad.getArticulosAll(id,function(articulos){
		if(articulos){
			return res.send(articulos);
		}
	});
});

/*************************************
--------------------------------------
-------------CLIENTES-----------------
--------------------------------------
*************************************/

//Crear Cliente
app.post('/clientes/agregar',function(req,res){
	var ced = req.param('ced','');
	var nom = req.param('nom','');
	var ape_1 = req.param('ape_1','');
	var ape_2 = req.param('ape_2','');
	var nom_emp = req.param('nom_emp','');
	var direccion = req.param('direccion','');
	var telefono = req.param('telefono','');
	var mail = req.param('mail','');

	if(ced && nom && ape_1 && ape_2 && nom_emp && direccion && telefono && mail){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}

	Cliente.agregarCliente(ced, nom, ape_1, ape_2, nom_emp, direccion, telefono, mail, function(data){
		if(!data){
			obj = {
				isTrue : false,
				msg : "No se agrego el cliente."
			};
			return res.send(obj);
		}else{


			Historial.agregarRegistro(req.session.mail, "Agregó el cliente: " + nom + " "+ ape_1 + " " + ape_2, function(err){
			if(!err){
					console.log('No se Agregó registro.');
				}
			});

			Cliente.getCliente_nom(nom, function(cliente){
				obj = {
				isTrue : true,
				msg : "Cliente: "+nom+" agregado.",
				cliente:cliente
				};
				return res.send(obj);
			});

		}
	});
});

//GET ALL CLIENTES
app.post('/clientes/getAllClientes', function(req, res){
	Cliente.getClientesAll(function(clientes){
		if(!clientes){
			res.send(400);
		}else{
			res.send(clientes);
		}
	});
});

app.post('/clientes/editarCliente', function(req, res){
	var id=req.param('id','');
	var ced = req.param('ced','');
	var nombre=req.param('nombre','');
	var ape_1 = req.param('ape_1','');
	var ape_2 = req.param('ape_2','');
	var nom_emp = req.param('nom_emp','');
	var direccion = req.param('direccion','');
	var telefono = req.param('telefono','');
	var mail = req.param('mail','');

	if(ced && nombre && ape_1 && ape_2 && nom_emp && direccion && telefono && mail){}else{
		obj = {
			isTrue : false,
			msg : "Tiene que llenar todos los campos."
		};
		return res.send(obj);
	}

	Cliente.editarCliente(id, ced, nombre, ape_1, ape_2, nom_emp, direccion, telefono, mail, function(data){
		if(!data){
			obj = {
			isTrue : false,
			msg : "No se editó el Cliente: "+ nombre +"."
		};
		return res.send(obj);
		}else{
			Cliente.getCliente(id, function(cliente){
				Historial.agregarRegistro(req.session.mail, "Editó el cliente: " + cliente.cli_nombre + " "+ cliente.cli_ape_1 + " " + cliente.cli_2, function(err){
				if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			obj = {
			isTrue : true,
			msg : "Se editó el cliente: "+ nombre +"."
		};
		return res.send(obj);
		}
	});
});
app.post('/clientes/eliminarCliente', function(req, res){
	var id = req.param('id', '');
	Cliente.getCliente(id, function(cli){
		Cliente.eliminarCliente(id, function(cliente){
		if(!cliente){
			res.send(false);
		}else{
			Historial.agregarRegistro(req.session.mail, "Eliminó el cliente: " + cli.cli_nombre + " "+ cli.cli_ape_1 + " " + cli.cli_2, function(err){
			if(!err){
					console.log('No se Agregó registro.');
				}
			});
			res.send(true);
		}
	});
	});
});

app.post('/clientes/getCliente', function(req, res){
	var id = req.param('id', '');
	Cliente.getCliente(id, function(cliente){
		if(!cliente){
			res.send(null);
		}else{
			res.send(cliente);
		}
	});
});

/*app.post('/clientes/getClienteNom', function(req, res){
	var txt = req.param('txt', '');
	Cliente.getClientes_cli_nombre_LIKE(txt, function(clientes){
		if(!clientes){
			res.send(null);
		}else{
			res.send(clientes);
		}
	});
});*/

//GET CLIENTE LIKE NOMBRE
app.post('/clientes/getCliente_Nom', function(req, res){
	var nom = req.param('nom', '');
	Cliente.getClientes_cli_nombre_LIKE(nom, function(clientes){
		if(!clientes){
			res.send(null);
		}else{
			res.send(clientes);
		}
	});
});
//GET CLIENTE LIKE CEDULA
app.post('/clientes/getCliente_Ced',function(req, res){
	var ced = req.param('ced','');
	Cliente.getClientes_cli_cedula_LIKE(ced, function(clientes){
		if(!clientes){
			res.send(null);
		}else{
			res.send(clientes);
		}
	});
});

//GET CLIENTE LIKE EMPRESA
app.post('/clientes/getCliente_Emp',function(req, res){
	var emp = req.param('emp','');
	Cliente.getClientes_cli_empresa_LIKE(emp, function(clientes){
		if(!clientes){
			res.send(null);
		}else{
			res.send(clientes);
		}
	});
});

/*************************************
--------------------------------------
-------------HISTORIAL----------------
--------------------------------------
*************************************/

app.post('/historiales/getAllHistoriales', function(req, res){
	Historial.getAllHistoriales(function(historiales){
		if(!historiales){
			res.send(400);
		}else{
			res.send(historiales);
		}
	});
});

/*************************************
--------------------------------------
-------------BITACORA-----------------
--------------------------------------
*************************************/

//AGREGAR BITACORA
app.post('/bitacoras/crearBitacora',function(req, res){
	var enc=req.param('enc',null),
		desc=req.param('desc',null),
		fecha=req.param('fecha',null),
		hra_inicio=req.param('hra_inicio',null),
		hra_final=req.param('hra_final',null),
		dir=req.param('dir',null),
		part=req.param('part',null),
		comp=req.param('comp',null);


		if(enc&&desc&&fecha&&hra_inicio&&hra_final&&dir&&part&&comp){}else{
			obj = {
				isTrue : false,
				msg : "Tiene que llenar todos los campos."
			};
			return res.send(obj);
		}

		msg="";
		if(Number(part)){}else{
			msg = "'Participante' valor no numérico. </br>";
		}
		if(Number(part)){}else{
			msg += "'Compartimos' valor no numérico. </br>";
		}
		if(msg.length>0){
			obj = {
				isTrue : false,
				msg : msg
			};
			return res.send(obj);
		}

		Bitacora.agregarBitacora(enc, desc,fecha,hra_inicio,hra_final,dir,part,comp,function(bitacora){
			if(!bitacora){

				obj = {
					isTrue : false,
					msg : "No se agrego bitácora."
				};
				return res.send(obj);
			}else{

				Historial.agregarRegistro(req.session.mail, "Agregó bitácora con fecha: " + fecha+" - encargado: "+enc, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});

				obj = {
					isTrue : true,
					msg : "Se agregó bitácora.",
					_id:bitacora._id
				};
				return res.send(obj);
			}
		});
});
//EDITAR BITACORA
app.post('/bitacoras/editarBitacora',function(req, res){
	var id=req.param('id',null),
		enc=req.param('enc',null),
		desc=req.param('desc',null),
		fecha=req.param('fecha',null),
		hra_inicio=req.param('hra_inicio',null),
		hra_final=req.param('hra_final',null),
		dir=req.param('dir',null),
		part=req.param('part',null),
		comp=req.param('comp',null);


		if(enc&&desc&&fecha&&hra_inicio&&hra_final&&dir&&part&&comp){}else{
			obj = {
				isTrue : false,
				msg : "Tiene que llenar todos los campos."
			};
			return res.send(obj);
		}

		msg="";
		if(Number(part)){}else{
			msg = "'Participante' valor no numérico. </br>";
		}
		if(Number(part)){}else{
			msg += "'Compartimos' valor no numérico. </br>";
		}
		if(msg.length>0){
			obj = {
				isTrue : false,
				msg : msg
			};
			return res.send(obj);
		}

		Bitacora.editarBitacora(id, enc, desc,fecha,hra_inicio,hra_final,dir,part,comp,function(data){
			if(!data){

				console.log('No se editó bitácora.');
				obj = {
					isTrue : false,
					msg : "No se editó bitácora."
				};
				return res.send(obj);
			}else{

				Historial.agregarRegistro(req.session.mail, "Editó bitácora con fecha: " + fecha+" - encargado: "+enc, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});

				obj = {
					isTrue : true,
					msg : "Se editó bitácora."
				};
				return res.send(obj);
			}
		});
});


//ALMACENAR ACTIVIDAD BITACORA
app.post('/bitacoras/almacenarActividad',function(req,res){
	bit_id=req.param('bit_id',null);
	act_id=req.param('act_id',null);

	Actividad.getActividad(act_id, function(actividad){
		if(!actividad){
			return res.send(null);
		}else{
			Bitacora.almacenarActividad(bit_id,actividad,function(data){
				if(!data){
					return res.send(false);
				}else{
					Bitacora.getBitacora(bit_id, function(bitacora){
						Historial.agregarRegistro(req.session.mail, "Agregó act: "+actividad.act_nombre+" a bitácora con fecha: "+bitacora.bit_fecha+" encargado: "+bitacora.bit_nom_enc, function(err){
							if(!err){
								console.log('No se Agregó registro.');
							}
						});
					});
					return res.send(true);
				}
			});
		}
	});

});

//EXTRAER ACTIVIDAD BITACORA
app.post('/bitacoras/extraerActividad',function(req, res){

	bit_id=req.param('bit_id',null);
	act_id=req.param('act_id',null);

	Bitacora.extraerActividad(bit_id, act_id, function(data){
		if(!data){
			return res.send(false);
		}else{
			Bitacora.getBitacora(bit_id, function(bitacora){
				Historial.agregarRegistro(req.session.mail, "Extrajó act. de bitácora con fecha: "+bitacora.bit_fecha+" encargado: "+bitacora.bit_nom_enc, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			return res.send(true);
		}
	});
});


//ELIMINAR BITACORA
app.post('/bitacoras/eliminarBitacora',function(req,res){
	var id = req.param('id',null);
	Bitacora.getBitacora(id, function(bit){
			Bitacora.eliminarBitacora(id, function(data){
			if(!data){
				return res.send(false);
			}else{
				Historial.agregarRegistro(req.session.mail, "Eliminó bitácora con fecha: "+bit.bit_fecha+" encargado: "+bit.bit_nom_enc, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
				return res.send(true);
			}
		});
	});
});

//GET ALL BITACORAS -> NO EXTRAIDO DE INVENTARIO
app.post('/bitacoras/getBitacorasAll_noExtraido',function(req, res){
	Bitacora.getBitacorasAll_noExtraido(function(bitacoras){
		return res.send(bitacoras);
	});
});

//GET BITACORA ID
app.post('/bitacoras/getBitacora',function(req, res){
	id = req.param('id',null);
	Bitacora.getBitacora(id,function(bitacora){
		if(!bitacora){
			return res.send(null);
		}else{
			return res.send(bitacora);
		}
	});
});


//GET BITACORA ACTIVIDADES
app.post('/bitacoras/getActividades',function(req,res){
	id = req.param('id',null);
	Bitacora.getActividades(id, function(actividades){
		if(!actividades){
			return res.send(null);
		}else{
			return res.send(actividades);
		}
	});
});

//GET ALL BITACORAS -> ALL
app.post('/bitacoras/getBitacorasAll',function(req, res){
	Bitacora.getBitacorasAll(function(bitacoras){
		return res.send(bitacoras);
	});
});

//CAMBIAR ESTADO A EXTRAIDO ---> BITACORA
app.post('/bitacoras/extraerBitacora',function(req, res){
	id = req.param('id','');
	Bitacora.extraerBitacora(id, function(data){
		if(!data){
			res.send(false);
		}else{
			Bitacora.getBitacora(bit_id, function(bitacora){
				Historial.agregarRegistro(req.session.mail, "Extrajó bitácora con fecha: "+bitacora.bit_fecha+" encargado: "+bitacora.bit_nom_enc, function(err){
					if(!err){
						console.log('No se Agregó registro.');
					}
				});
			});
			res.send(true);
		}
	});
});

app.post('/bitacoras/getBitacoras_bit_nom_enc',function(req, res){
	nom = req.param('nom_enc','');
	Bitacora.getBitacoras_bit_nom_enc(nom, function(bitacoras){
		if(!bitacoras){
			res.send(false);
		}else{
			res.send(bitacoras);
		}
	});
});

app.post('/bitacoras/getBitacoras_bit_fecha',function(req, res){
	fecha = req.param('fecha','');
	Bitacora.getBitacoras_bit_fecha(fecha, function(bitacoras){
		if(!bitacoras){
			res.send(false);
		}else{
			res.send(bitacoras);
		}
	});
});


/***********************************
------------------------------------
--------------HISTORIAL-------------
------------------------------------
***********************************/
app.post('/historial/getRegistros_nombre',function(req, res){
	nom = req.param('nom','');
	Historial.getRegistros_nombre(nom, function(registros){
		if(registros.length !=0){
			res.send(registros);
		}else{
			res.send(null);
		}
	});
});

app.post('/historial/getRegistros_fecha',function(req, res){
	fec = req.param('fec','');
		Historial.getRegistros_fecha(fec, function(registros){
		if(!registros){
			res.send(null);
		}else{
			res.send(registros);
		}
	});

});

app.post('/historial/getRegistros_descripcion',function(req, res){
	desc = req.param('desc','');
		Historial.getRegistros_descripcion(desc, function(registros){
		if(registros.length !=0){
			res.send(registros);
		}else{
			res.send(null);
		}
	});

});

app.post('/historial/getRegistrosAll',function(req, res){
	desc = req.param('desc','');
		Historial.getRegistrosAll(function(registros){
		if(registros){
			res.send(registros);
		}else{
			res.send(null);
		}
	});

});

app.listen(3000);