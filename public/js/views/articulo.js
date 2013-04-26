define(['text!templates/articulo-index.html', 'backbone', 'underscore'],function(tmpArticuloIndex, Backbone, _){
	ArticuloView = Backbone.View.extend({
		el:$('#content'),
		model:null,
		events:{
			'click #btnAgregar':'agregar',
			'change #txtBuscar' :'getArticuloNom',
			'click #btnGuardar':'guardar',
			'click #btnPerfil':'render',
			'click #btnInventario':'cont_inventario'
		},
		agregar:function(){
			var nom = $('input[name="nombre"]').val(),
				desc = $('input[name="des"]').val();

				var s_presta = $('input[name="rbSepresta"]:checked').val();
				var t_serie = $('input[name="rbT_serie"]:checked').val();

				if(s_presta == "true")
				{
					s_presta = true;
				}else{
					s_presta = false;
				}

				if(t_serie == "true")
				{
					t_serie = true;
				}else{
					t_serie = false;
				}

				$('#error').empty().hide();
				$('#exito').empty().hide();
				$.post('/articulos/agregar',{
					nom:nom,
					desc:desc,
					t_serie:t_serie,
					s_presta:s_presta
				},function(data){
					if(!data.isTrue){
						$('#error').fadeIn(1000).html(data.msg).fadeOut(3000);
					}else{
						$('#exito').fadeIn(1000).html(data.msg).fadeOut(3000);

						//AGREGO A LA LISTA.
						tmp = $('#item-articulo').html();
						html = Handlebars.compile(tmp);
						$('#lista-articulos').append(html(data.articulo)).fadeIn(1000);

						$('input[name="nombre"]').val(''),
						$('input[name="des"]').val('');
					}
				});
		},
		guardar:function(){
			var id = $('#_id').val();
			var nombre = $('#nombre_editar').val();
			var desc = $('#desc_editar').val();
			var t_serie = $('input[name="rbT_serie_editar"]:checked').val();
			var s_presta = $('input[name="rbSepresta_editar"]:checked').val();

			$.post('/articulos/editarArticulo', {
				id:id,
				nombre:nombre,
				desc:desc,
				t_serie:t_serie,
				s_presta:s_presta
			},function(data){
				$('#error_editar').empty().hide();
				$('#exito_editar').empty().hide();
				if(!data.isTrue){
					$('#error_editar').fadeIn(1000).html(data.msg).fadeOut(3000);
				}else{
					$('#exito_editar').fadeIn(1000).html(data.msg).fadeOut(3000);
				}
			});
			this.getAllArticulos();
		},
		getAllArticulos :function(){

			$.post('/articulos/getAllArticulos',{},function(data){
				$('#lista-articulos').empty();
				tmp = $('#item-articulo').html();
				html = Handlebars.compile(tmp);
				$.each(data, function(i, articulo){
					$('#lista-articulos').append(html(articulo)).fadeIn(1000);
				});
				return;
			});
		},
		getArticuloNom:function(){
			$('#cont_inventario').fadeOut(500);
			$('#cont_inventario_no_serie').fadeOut(500);
			$('#cont_prestar_devolver').fadeOut(500);

			$('#lista-articulos').empty();
			var txt = $('#txtBuscar').val();
			if(txt===""){
				this.getAllArticulos();
				this.getArticulos_inventario();
				return;
			}


			$.post('/articulos/getArticuloNom',{txt:txt},function(articulos){
				if(!articulos){

				}else{
					$('#lista-articulos').empty();
					tmp = $('#item-articulo').html();
					html = Handlebars.compile(tmp);
					$.each(articulos,function(i, articulo){
						$('#lista-articulos').append(html(articulo)).fadeIn(1000);
					});

					$('#cont_tbl').empty();
					tmp = $('#fila_articulo').html();
					html = Handlebars.compile(tmp);
					$.each(articulos,function(i, articulo){
						$('#cont_tbl').append(html(articulo)).fadeIn(1000);
					});
					tmp=_.template($('#fila_articulo_listener').html());
					$('#div_cont_articulo').append(tmp);
					return;
				}
			});
		},
		render:function(){

			this.$el.empty();
			this.$el.html(tmpArticuloIndex);
			tmp = _.template($('#tmp_gestion_articulo').html());
			$('#div_cont_articulo').html(tmp).fadeIn(2000);
			this.getAllArticulos();

			$('#txtBuscar').bind('textchange',function(){
				$('#txtBuscar').change();
			});


		},
		cont_inventario:function(){

			this.$el.empty();
			this.$el.html(tmpArticuloIndex);
			tmp = _.template($('#tmp_articulos_inventario').html());
			$('#div_cont_articulo').html(tmp).fadeIn(2000);
			$('#cont-articulos_inventario').fadeIn(1000);
			$('#txtBuscar').bind('textchange',function(){
				$('#txtBuscar').change();
			});
			this.getArticulos_inventario();

		},
		getArticulos_inventario:function(){

			$.post('/articulos/getAllArticulos',{},function(articulos){
				if(!articulos){

				}else{
					$('#cont_tbl').empty();
					tmp = $('#fila_articulo').html();
					html = Handlebars.compile(tmp);
					$.each(articulos,function(i, articulo){
						$('#cont_tbl').append(html(articulo));
					});
					tmp=_.template($('#fila_articulo_listener').html());
					$('#div_cont_articulo').append(tmp);
				}
			});

		}
	});
	return new ArticuloView();
});