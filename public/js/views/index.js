define(['text!templates/index.html', 'text!templates/menu.html', 'backbone', 'underscore'],function(indexTemplate,menuTemplate, Backbone, _){

		indexView = Backbone.View.extend({
		el:$('#content'),
		model:null,
		events:{
			'click #btnEditar' : 'editar',
			'click #btnCancelar' : 'cancelar',
			'click #btnPerfil' : 'cancelar',
			'click #btnGuardar': 'guardar',
			'click #btnNuevo': 'nuevo',
			'click #btnAgregar':'agregar',
			'click #btnLista': 'listaUsuarios',
			'change #txtBuscar': 'getUsuarios'
		},
		initialize:function(){
		},
		editar:function(){
			var tmp_editar_perfil = _.template($('#tmp_editar_perfil').html());
			$.post('/cuenta/me',{},function(obj){
						var tmp_editar_perfil = _.template($('#tmp_editar_perfil').html());
						$('#div_perfil').empty().html(tmp_editar_perfil(obj)).show(1000);
					});
		},
		cancelar:function(){
			var tmp_ver_perfil = _.template($('#tmp_ver_perfil').html());
			$.post('/cuenta/me',{},function(obj){
				var tmp_ver_perfil = _.template($('#tmp_ver_perfil').html());
				$('#div_perfil').empty().html(tmp_ver_perfil(obj)).show(1000);
			});
		},
		guardar:function(){

			var nombre = $('input[name="nombre"]').val();
			var ape_1 = $('input[name="ape_1"]').val();
			var ape_2 = $('input[name="ape_2"]').val();
			var mail = $('input[name="mail"]').val();
			var direccion = $('input[name="direccion"]').val();
			var telefono = $('input[name="telefono"]').val();

			$.post("/cuenta/editar",{
				nombre:nombre,
				ape_1:ape_1,
				ape_2:ape_2,
				mail:mail,
				direccion:direccion,
				telefono:telefono
			}, function(data){
				if(!data){
					$('#error').fadeIn(1000).html(data.msg);
				}else{
					//Obtenemos Socio
					$.post('/cuenta/me',{},function(obj){
						var tmp_ver_perfil = _.template($('#tmp_ver_perfil').html());
						$('#div_perfil').html(tmp_ver_perfil(obj));
						$('#exito').empty().html(data.msg).fadeIn(1000);
					});
				}
			});
		},
		nuevo:function(){
			var tmp_agregar = _.template($('#tmp_agregar').html());
			$('#div_perfil').html(tmp_agregar).fadeIn(1000);
		},
		agregar: function(){
			var nombre = $('input[name="nombre"]').val();
			var ape_1 = $('input[name="ape_1"]').val();
			var ape_2 = $('input[name="ape_2"]').val();
			var pass1 = $('input[name="pass1"]').val();
			var pass2 = $('input[name="pass2"]').val();
			var mail = $('input[name="mail"]').val();
			var direccion = $('textarea[name="direccion"]').val();
			var telefono = $('input[name="telefono"]').val();

			//Obtener usuario actual

			$.post('/registrar',{

				nombre:nombre,
				primero:ape_1,
				segundo:ape_2,
				pass1:pass1,
				pass2:pass2,
				mail:mail,
				direccion:direccion,
				telefono:telefono

			},function(data){
				if(!data.isTrue){
					$('#error').empty().fadeIn(1000).html(data.msg);
				}else{
					$('#error').empty();
					$('#exito').fadeIn(1000).html(data.msg);
				}
			});
		},
		listaUsuarios:function(){
			$('#lista_cuentas').html("");
			$.post('/cuenta/getCuentasAll',{},function(objs){
				var tmp_cont_lista = _.template($('#tmp_cont_lista').html());
				$('#div_perfil').html(tmp_cont_lista);

				tmp_cuenta = _.template($('#tmp_cuenta').html());
				$.each(objs,function(i, obj){
					$('#lista_cuentas').append(tmp_cuenta(obj)).fadeIn(2000);
				});

					//CHANGE TEXT PLUGIN
					$('#txtBuscar').bind('textchange',function(){
					$('#txtBuscar').change();
				});
			});
		},
		getUsuarios:function(){
			var txt =document.getElementById('txtBuscar').value;
			var tmp_cuenta = _.template($('#tmp_cuenta').html());
			$('#lista_cuentas').empty();
			if(txt===""){//ALL USUARIOS
					$.post('/cuenta/getCuentasAll',{},function(objs){
					$('#lista_cuentas').empty();
					$.each(objs,function(i, obj){
						$('#lista_cuentas').append(tmp_cuenta(obj)).fadeIn(1000);
					});
				});
			}else{
				var check;
				if($('#rbEmail').is(':checked')){
					check='email';
				}else{
					check='nombre';
				}
				$.post('/cuenta/getCuentas_val',{txt:txt, check:check}, function(usuarios){
					$('#lista_cuentas').empty();
					$.each(usuarios, function(i, usuario){
						$('#lista_cuentas').append(tmp_cuenta(usuario)).fadeIn(1000);
					});
				});
			}

		},
		render:function(){
			this.$el.html(indexTemplate);
			$('#header').html(menuTemplate);
			var tmp_ver_perfil = _.template($('#tmp_ver_perfil').html());
			$('#div_perfil').html(tmp_ver_perfil(this.model)).fadeIn(2000);
        return this;
		}

	});

	return new indexView();
});