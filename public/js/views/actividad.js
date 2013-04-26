define(['text!templates/actividad-index.html', 'backbone','underscore'],
	function(tmpIndexActividad, Backbone, _){
		ActividadView = Backbone.View.extend({
			el:$('#content'),
			events:{
				'click #btnAgregar':'agregar',
				'change #txtBuscar':'getArticulo',
				'change #txtBuscarAct':'getActividad',
				'click #btnGuardar':'guardar',
				'click #btnAgregarArticulo' : 'cargarCont',
				'click #cerrarCont':'cerrarCont',
				'click #btnPerfil':'render'
			},
			agregar:function(){
				var nombre = $('input[name="nombre"]').val(),
					desc = $('input[name="desc"]').val(),
					duracion= $('input[name="dur"]').val();

					$('#error').empty().hide();
					$('#exito').empty().hide();
					var tam = $('#div-agregar-articulos #cont-item-articulo').length;
					if(tam<=0){
						$('#error').fadeIn(1000).html("No se agregó ningun articulo.").fadeOut(4000);
						return;
					}

					$.post('/actividades/agregarActividad',{
						nombre:nombre,
						desc:desc,
						duracion:duracion
					},function(obj){
						if(!obj){
							$('#error').fadeIn(1000).html(obj.msg).fadeOut(4000);
							return;
						}else{
							//AGREGAR ARTICULOS
							id_actividad = obj._id;
							var isTrue=false;
							$('#div-agregar-articulos .item-art-actividad').each(function(){
								id_articulo = $(this).attr('value');
								$.post('/actividades/almacenarArticulo',{
									id_actividad:id_actividad,
									id_articulo:id_articulo
								},function(data){
									if(!data){
										//Borrar Actividad.
										$('#error').fadeIn(1000).html('Se presentó un error, actividad no pudo ser creada.').fadeOut(4000);
										$.post('/actividades/eliminarActividad',{id:id_actividad},function(err){
										});
										return;
									}else{
										console.log('Se agrego articulo.');
									}
								});
							});

							$('#error').empty().fadeOut(100);
							$('#exito').fadeIn(1000).html('Se agregó actividad: '+ nombre).fadeOut(4000);
							$('#gestion-actividades').fadeIn(2000);
							$.post('/actividades/getActividad',{id:id_actividad}, function(actividad){
								var tmp_m = $('#tmp-item-actividad').html();
								html = Handlebars.compile(tmp_m);
								$('#cont-act').append(html(actividad)).fadeIn(1000);
							});

							$('input[name="nombre"]').val('');
							$('input[name="desc"]').val('');
							$('input[name="dur"]').val('');
							$('#div-agregar-articulos').empty();
							$('#error').hide();

						}
					});
			},
			guardar:function(){
				var id = $('input[name="_id"]').val();
				var nom = $('input[name="nom_edit"]').val(),
					desc= $('input[name="desc_edit"]').val(),
					dur =$('input[name="dur_edit"]').val();

					$('#error_edit').empty().hide();
					$('#exito_edit').empty().hide();
					$.post('/actividades/editarActividad',{
						id:id,
						nom:nom,
						desc:desc,
						dur:dur
					},function(data){
						if(!data){
							$('#error_edit').fadeIn(1000).html(data.msg).fadeOut(4000);
						}else{
							$('#exito_edit').fadeIn(1000).html(data.msg).fadeOut(4000);
						}
					});
					if(nom&&desc&&dur){
						this.getAllActividades();
					}
			},
			cargarCont:function(){

				$('#cont-agregar-art-edit').fadeIn(2000).show();

				$.post('/articulos/getAllArticulos_no_serie',{},function(articulos){
						$('#lista-agregar-art-edits').empty();
						tmp = $('#item-articulo-edit').html();
						html = Handlebars.compile(tmp);
						$.each(articulos, function(i, articulo){
							$('#lista-agregar-art-edit').append(html(articulo)).fadeIn(1000);
						});
						tmp = _.template($('#listenerAgregar').html());
						$('#cont-agregar-art-edit').append(tmp);
					return;
				});
			},
			cerrarCont:function(){
				$('#cont-agregar-art-edit').fadeOut(1000);
			},
			render:function(){
				this.$el.html(tmpIndexActividad);
				tmp = _.template($('#tmp_actividades').html());
				$('#div_cont_actividades').html(tmp).fadeIn(1000);

				this.getAllArticulos_no_serie();
				this.getAllActividades();

					$('#txtBuscar').bind('textchange',function(){
					$('#txtBuscar').change();
				});

					$('#txtBuscarAct').bind('textchange',function(){
					$('#txtBuscarAct').change();
				});

			},
			getArticulo:function(){
				$('#cont-articulos').empty();
				var txt = $('#txtBuscar').val();
				if(txt===""){
					this.getAllArticulos_no_serie();
					return;
				}


				$.post('/articulos/getArticuloNom',{txt:txt},function(articulos){
					if(!articulos){

					}else{
						$('#cont-articulos').empty();
						tmp = $('#item-articulo').html();
						html = Handlebars.compile(tmp);
						$.each(articulos, function(i, articulo){
							$('#cont-articulos').append(html(articulo));
						});
					}
				});
			},
			getAllArticulos_no_serie :function(){

				$.post('/articulos/getAllArticulos_no_serie',{},function(articulos){
						$('#cont-articulos').empty();
						tmp = $('#item-articulo').html();
						html = Handlebars.compile(tmp);
						$.each(articulos, function(i, articulo){
							$('#cont-articulos').append(html(articulo));
						});
					return;
				});
			},
			getActividad:function(){
				$('#cont-acts').empty();
				var txt = $('#txtBuscarAct').val();
				if(txt===""){
					this.getAllActividades();
					return;
				}

				var op = $('input[name="rbActividad"]:checked').val();
				if(op == 'nombre'){
					$.post('/actividades/getActividad_Nom', {nom:txt},function(actividades){
						var tmp_m = $('#tmp-item-actividad').html();
						html = Handlebars.compile(tmp_m);

						$('#cont-act').empty();
						$.each(actividades,function(i, actividad){
							$('#cont-act').append(html(actividad)).fadeIn(1000);
						});
					});
				}else{
					$.post('/actividades/getActividad_Desc', {desc:txt},function(actividades){
						var tmp_m = $('#tmp-item-actividad').html();
						html = Handlebars.compile(tmp_m);

						$('#cont-act').empty();
						$.each(actividades,function(i, actividad){
							$('#cont-act').append(html(actividad)).fadeIn(1000);
						});
					});
				}
			},
			getAllActividades:function(){
				$('#cont-act').empty();
				$.post('/actividades/getActividadesAll',{},function(actividades){
					if(actividades.length<=0){
						return;
					}

					var tmp_m = $('#tmp-item-actividad').html();
					html = Handlebars.compile(tmp_m);

					$('#gestion-actividades').fadeIn(2000);
					$.each(actividades,function(i, actividad){
						$('#cont-act').append(html(actividad)).fadeIn(1000);
					});
				});
			}

		});
		return new ActividadView();
});