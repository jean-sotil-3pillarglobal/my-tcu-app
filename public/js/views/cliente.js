define(['text!templates/cliente-index.html', 'backbone','underscore'], function(tmpClienteIndex, Backbone, _){
		ClienteView = Backbone.View.extend({
			el:$('#content'),
			events:{
				'click #btnAgregar':'agregar',
				//'change #txtBuscar' :'getClienteNom',
				'change #txtBuscar' :'getCliente',
				'click #btnGuardar':'guardar'
			},
			agregar:function(){
				var ced = $('input[name="ced"]').val(),
					nom = $('input[name="nombre"]').val(),
					ape_1 = $('input[name="ape_1"]').val(),
					ape_2= $('input[name="ape_2"]').val(),
					nom_emp = $('input[name="nom_emp"]').val(),
					direccion = $('input[name="direccion"]').val(),
					telefono = $('input[name="telefono"]').val(),
					mail = $('input[name="mail"]').val();

					$('#error').empty().hide();
					$('#exito').empty().hide();
					$.post('/clientes/agregar',{
						ced:ced,
						nom:nom,
						ape_1:ape_1,
						ape_2:ape_2,
						nom_emp:nom_emp,
						direccion: direccion,
						telefono:telefono,
						mail:mail
					},function(data){
						if(!data.isTrue){
							$('#error').show(1000).html(data.msg);
						}else{
							$('#exito').show(1000).html(data.msg);

						//AGREGO A LA LISTA.
						tmp = $('#item-cliente').html();
						html = Handlebars.compile(tmp);
						$('#lista-clientes').append(html(data.cliente)).show(1000);
					}
				});
			},
			guardar:function(){
				var id = $('#_id').val();
				var ced = $('#ced_editar').val();
				var nombre = $('#nombre_editar').val();
				var ape_1 = $('#ape_1_editar').val();
				var ape_2 = $('#ape_2_editar').val();
				var nom_emp = $('#nom_emp_editar').val();
				var direccion = $('#direccion_editar').val();
				var telefono = $('#telefono_editar').val();
				var mail = $('#mail_editar').val();

				//console.log(id, ced, nombre, ape_1,ape_2,nom_emp,direccion,telefono,mail);

				$.post('/clientes/editarCliente', {
					id:id,
					ced:ced,
					nombre:nombre,
					ape_1:ape_1,
					ape_2:ape_2,
					nom_emp:nom_emp,
					direccion: direccion,
					telefono:telefono,
					mail:mail
				},function(data){
					$('#error_editar').empty().hide();
					$('#exito_editar').empty().hide();
					if(!data.isTrue){
						$('#error_editar').show(1000).html(data.msg);
					}else{
						$('#exito_editar').show(1000).html(data.msg);
					}
				});
				this.getAllClientes();
			},
			getAllClientes :function(){

				$.post("/clientes/getAllClientes",{},function(data){
					$('#lista-clientes').empty();
					tmp = $('#item-cliente').html();
					html = Handlebars.compile(tmp);
					$.each(data, function(i, cliente){
						$('#lista-clientes').append(html(cliente)).show(1000);
					});
					return;
				});
			},
			/*getClienteNom:function(){

				$('#lista-clientes').empty();
				var txt = $('#txtBuscar').val();
				if(txt===""){
					this.getAllClientes();
					return;
				}


				$.post('/clientes/getClienteNom',{txt:txt},function(clientes){
					if(!clientes){

					}else{
						$('#lista-clientes').empty();
						tmp = $('#item-cliente').html();
						html = Handlebars.compile(tmp);
						$.each(clientes,function(i, cliente){
							$('#lista-clientes').append(html(cliente)).show(1000);
						});
						return;
					}
				});
			},*/
			getCliente:function(){
				$('#lista-clientes').empty();
				var txt = $('#txtBuscar').val();
				if(txt===""){
					this.getAllClientes();
					return;
				}
				txt = txt.trim();
				var op = $('input[name="rbCliente"]:checked').val();
				if(op == 'nombre'){
					$.post('/clientes/getCliente_Nom', {nom:txt},function(clientes){
						var tmp_m = $('#item-cliente').html();
						console.log(clientes);
						html = Handlebars.compile(tmp_m);

						$('#lista-clientes').empty();
						$.each(clientes,function(i, cliente){
							$('#lista-clientes').append(html(cliente)).fadeIn(1000);
						});
					});
				}if(op == 'cedula'){
					$.post('/clientes/getCliente_Ced', {ced:txt},function(clientes){
						var tmp_m = $('#item-cliente').html();
						html = Handlebars.compile(tmp_m);

						$('#lista-clientes').empty();
						$.each(clientes,function(i, cliente){
							$('#lista-clientes').append(html(cliente)).fadeIn(1000);
						});
					});
				}
				else{
					$.post('/clientes/getCliente_Emp', {emp:txt},function(clientes){
						var tmp_m = $('#item-cliente').html();
						html = Handlebars.compile(tmp_m);

						$('#lista-clientes').empty();
						$.each(clientes,function(i, cliente){
							$('#lista-clientes').append(html(cliente)).fadeIn(1000);
						});
					});
				}
			},
			render:function(){

			this.$el.empty();
			this.$el.html(tmpClienteIndex);
			tmp = _.template($('#tmp_gestion_cliente').html());
			$('#div_cont_cliente').fadeIn('slow').html(tmp);
			this.getAllClientes();

			$('#txtBuscar').bind('textchange',function(){
				$('#txtBuscar').change();
			});


		}
		});
		return new ClienteView();
});