define(['text!templates/bitacora-index.html', 'backbone','underscore'],function(tmpIndexBitacora, Backbone, _){
	BitacoraView = Backbone.View.extend({
		el:$('#content'),
		events:{
			'click #cerrarCont':"cerrarCont",
			'click #cerrarCont_edit':"cerrarCont_edit",
			'click #btnVerActividades':'abrirCont',
			'change #txtBuscar': 'getActividad',
			'change input[name="hra_inicio"], #cerrarCont': 'ajustarHraFinal',
			'click input[name="hra_inicio_edit"]': 'ajustarHraFinal_edit',
			'click #btnAgregar': 'agregar',
			'click #rbFecha': 'cambiarInputDate',
			'click #rbNom': 'cambiarInputText',
			'click #btnAgregarActividad':'cargarCont',
			'click #btnGuardar':'guardar',
			'click #btnPerfil':'render',
			'click #btnExtraerCont':'cont_extraer',
			'change .chk':'habilitarBtn',
			'change #txtBuscarBit':'buscarBit',
			'change #txtFecha':'buscarBit_fec'
		},
		agregar:function(){
			var enc=$('input[name="nombre"]').val(),
				desc=$('input[name="desc"]').val(),
				fecha=$('input[name="fecha"]').val(),
				hra_inicio=$('input[name="hra_inicio"]').val(),
				hra_final=$('input[name="hra_final"]').val(),
				dir=$('input[name="dir"]').val(),
				part=$('input[name="participantes"]').val(),
				comp=$('input[name="se_comparte"]').val();

				$('#error').empty().hide();
				$('#exito').empty().hide();

				isTrue=true;
				divs = $('#lista-agregar-act .item-act');
				if(divs.length>0){

						//Creamos bitacora.
						$.post('/bitacoras/crearBitacora',{
						enc:enc,
						desc:desc,
						fecha:fecha,
						hra_inicio:hra_inicio,
						hra_final:hra_final,
						dir:dir,
						part:part,
						comp:comp
					},function(data){
						if(!data.isTrue){
							$('#error').fadeIn(1000).html(data.msg).fadeOut(4000);
							return;
						}else{
							bit_id = data._id;
							$(divs).each(function(){
								act_id = $(this).attr('value');

								//Agregar act a bit.
								$.post('/bitacoras/almacenarActividad',{bit_id:bit_id,act_id:act_id},function(data){
									if(data){
										console.log('Se agrego actividad.');
									}else{
										//Borrar Bitacora.
										$('#error').fadeIn(1000).html('Se presentó un error, bítacora no pudo ser creada.');
										$.post('/bitacoras/eliminarBitacora',{id:bit_id},function(err){
										});
										return;
									}

								});
								$('#gestion-bitacoras').fadeIn(1000);
								$('#exito').fadeIn(1000).html(data.msg).fadeOut(4000);
							});
						}
					});
				}else{
					isTrue = false;
					$('#error').fadeIn(1000).html('No se agregó ninguna actividad.').fadeOut(4000);
					return;
				}

				this.getBitacorasAll_noExtraido();


		},
		guardar:function(){
			var id=$('input[name="_id"]').val(),
				enc=$('input[name="nombre_edit"]').val(),
				desc=$('input[name="desc_edit"]').val(),
				fecha=$('input[name="fecha_edit"]').val(),
				hra_inicio=$('input[name="hra_inicio_edit"]').val(),
				hra_final=$('input[name="hra_final_edit"]').val(),
				dir=$('input[name="dir_edit"]').val(),
				part=$('input[name="participantes_edit"]').val(),
				comp=$('input[name="se_comparte_edit"]').val();

				$('#error').empty().hide();
				$('#exito').empty().hide();

				divs = $('#div-editar-actividades .item-act');
				if(divs.length>0){

						//Creamos bitacora.
						$.post('/bitacoras/editarBitacora',{
						id:id,
						enc:enc,
						desc:desc,
						fecha:fecha,
						hra_inicio:hra_inicio,
						hra_final:hra_final,
						dir:dir,
						part:part,
						comp:comp
					},function(data){
						if(!data.isTrue){
							$('#error_edit').fadeIn(1000).html(data.msg);
							return;
						}else{
							$('#exito_edit').fadeIn(1000).html(data.msg);
						}
					});
				}else{
					$('#error').fadeIn(1000).html('No contiene ninguna actividad. Procedemos a eliminar la bítacora');
					div_eliminar = $('.btnEliminar');
					$.each(div_eliminar,function(){
						id_eliminar=$(this).attr('id');

						if(id_eliminar.trim()==id.trim()){
							//ACTIVO EVENTO
							$(this).click();
							return;
						}
					});
				}
		},
		cargarCont:function(){
			$('#cont-agregar-act_edit').fadeIn(1000);
			$('#lista-agregar-act_edit').empty();

			$.post('/actividades/getActividadesAll',{},function(actividades){
				if(actividades.length<=0){
					return;
				}

				var tmp_m = $('#item-actividad_edit').html();
				html = Handlebars.compile(tmp_m);

				$.each(actividades,function(i, actividad){
					$('#lista-agregar-act_edit').append(html(actividad)).fadeIn(1000);
				});
				//Agregar LISTENER
				tmp = _.template($('#actividadItemListener_edit').html());
				$('#cont-agregar-act_edit').append(tmp);
			});
		},
		cerrarCont:function(){
			$('#cont-agregar-act').fadeOut(1000);
		},
		cerrarCont_edit:function(){
			$('#cont-agregar-act_edit').fadeOut(1000);
		},
		abrirCont:function(){
			$('#cont-agregar-act').fadeIn(1000).show();
			console.log('abrir');
		},
		ajustarHraFinal:function(){
			if($('input[name="hra_inicio"]').val()!==""){
				divs = $('#lista-agregar-act .hra_final');
				var min = 0;

				if(divs.length>0){
					$(divs).each(function(){
						min += parseInt($(this).attr('value'));
					});
				}

				arr = $('input[name="hra_inicio"]').val() + '';
				arr = arr.split(':');
				hr = new Date(2000,1,1,arr[0],arr[1],0);
				min = hr.getMinutes()+min;
				hr.setMinutes(min);
				hh = hr.getHours();

				mm = hr.getMinutes();
				mm = ''+mm;
				if(mm.length==1){
					mm='0'+mm;
				}

				document.getElementById('hra_final').value = hh+":"+mm;

			}
		},
		ajustarHraFinal_edit:function(){

			if($('input[name="hra_inicio_edit"]').val()!==""){
				divs = $('#div-editar-actividades .hra_final');
				var min = 0;

				if(divs.length>0){
					$(divs).each(function(){
						min += parseInt($(this).attr('value'));
					});
				}

				arr = $('input[name="hra_inicio_edit"]').val() + '';
				arr = arr.split(':');
				hr = new Date(2000,1,1,arr[0],arr[1],0);
				min = hr.getMinutes()+min;
				hr.setMinutes(min);
				hh = hr.getHours();

				mm = hr.getMinutes();
				mm = ''+mm;
				if(mm.length==1){
					mm='0'+mm;
				}

				document.getElementById('hra_final_edit').value = '00:00';
				document.getElementById('hra_final_edit').value = hh+":"+mm;

			}
		},
		cambiarInputDate:function(){
			$('#txtBuscarBit').fadeOut(1000);
			var input = $('<input>').attr({
				type:"date",
				id:"txtFecha"
			});
			$('#pbuscar').append(input);

		},
		cambiarInputText:function(){
			$('#txtBuscarBit').show(1000);
			$('#txtFecha').remove();
		},
		render:function(){
			this.$el.html(tmpIndexBitacora);
			tmp = _.template($('#tmp_bitacora').html());
			$('#div_cont_bitacoras').html(tmp).fadeIn(2000);
			$('#div-lista-actividades').fadeIn(1000);

			this.getAllActividades();
			this.getBitacorasAll_noExtraido();

				$('#txtBuscar').bind('textchange',function(){
				$('#txtBuscar').change();
			});

				$('#txtBuscarBit').bind('textchange',function(){
				$('#txtBuscarBit').change();
			});

		},
		getActividad:function(){
				$('#cont-actividades').empty();
				var txt = $('#txtBuscar').val();
				if(txt===""){
					this.getAllActividades();
					return;
				}

				var op = $('input[name="rbActividad"]:checked').val();
				if(op == 'nombre'){
					$.post('/actividades/getActividad_Nom', {nom:txt},function(actividades){
						var tmp_m = $('#item-actividad').html();
						html = Handlebars.compile(tmp_m);

						$('#cont-actividades').empty();
						$.each(actividades,function(i, actividad){
							$('#cont-actividades').append(html(actividad)).fadeIn(1000);
						});
						//Agregar LISTENER
						tmp = _.template($('#actividadItemListener').html());
						$('#cont-actividades').append(tmp);
					});
				}else{
					$.post('/actividades/getActividad_Desc', {desc:txt},function(actividades){
						var tmp_m = $('#item-actividad').html();
						html = Handlebars.compile(tmp_m);

						$('#cont-actividades').empty();
						$.each(actividades,function(i, actividad){
							$('#cont-actividades').append(html(actividad)).fadeIn(1000);
						});
						//Agregar LISTENER
						tmp = _.template($('#actividadItemListener').html());
						$('#cont-actividades').append(tmp);
					});
				}
			},
			getAllActividades:function(){
				$('#cont-actividades').empty();
				$.post('/actividades/getActividadesAll',{},function(actividades){
					if(actividades.length<=0){
						return;
					}

					var tmp_m = $('#item-actividad').html();
					html = Handlebars.compile(tmp_m);

					$.each(actividades,function(i, actividad){
						$('#cont-actividades').append(html(actividad)).fadeIn(1000);
					});
					//Agregar LISTENER
					tmp = _.template($('#actividadItemListener').html());
					$('#cont-actividades').append(tmp);
				});
			},
			getBitacorasAll_noExtraido:function(){
				$('#cont-bits').empty();
				$.post('/bitacoras/getBitacorasAll_noExtraido',{},function(bitacoras){
					if(bitacoras.length<=0){
						return;
					}

					var tmp_m = $('#item-bitacora').html();
					html = Handlebars.compile(tmp_m);

					$('#gestion-bitacoras').fadeIn(2000);
					$.each(bitacoras,function(i, bitacora){
						$('#cont-bits').append(html(bitacora)).fadeIn(1000);
					});

					//Agregar LISTENER
					tmp = _.template($('#item-bitacora-listener').html());
					$('#cont-bits').append(tmp);
				});
			},
			getBitacorasAll:function(){
				$('#cont_tbl').empty();
				$.post('/bitacoras/getBitacorasAll',{},function(bitacoras){
					if(bitacoras.length<=0){
						return;
					}

					var tmp_m = $('#tmp_fila_bitacora').html();
					html = Handlebars.compile(tmp_m);
					$('#cont_tbl').empty();
					$.each(bitacoras,function(i, bitacora){
						$('#cont_tbl').append(html(bitacora)).fadeIn(1000);
					});
					tmp_m = _.template($('#tmp_fila_bitacora_listener').html());
					$('#div_cont_bitacoras').append(tmp_m);
				});
			},
			buscarBit:function(){
				$('#bit_detalle').fadeOut(500);
				$('#cont_tbl').empty();
				var txt = $('#txtBuscarBit').val();
				if(txt===""){
					this.getBitacorasAll();
					return;
				}

				$.post('/bitacoras/getBitacoras_bit_nom_enc',{nom_enc:txt},function(bitacoras){
					if(bitacoras){
						var tmp_m = $('#tmp_fila_bitacora').html();
						html = Handlebars.compile(tmp_m);
						$('#cont_tbl').empty();
						$.each(bitacoras,function(i, bitacora){
							$('#cont_tbl').append(html(bitacora)).fadeIn(1000);
						});
						tmp_m = _.template($('#tmp_fila_bitacora_listener').html());
						$('#div_cont_bitacoras').append(tmp_m);
					}else{
						$('#error').html('No se encontraron bítacoras.').fadeIn(1000).fadeOut(4000);
					}
				});
			},
			buscarBit_fec:function(){
				$('#cont_tbl').empty();
				var fec = $('#txtFecha').val();

				$.post('/bitacoras/getBitacoras_bit_fecha',{fecha:fec},function(bitacoras){
					if(bitacoras){
						var tmp_m = $('#tmp_fila_bitacora').html();
						html = Handlebars.compile(tmp_m);
						$('#cont_tbl').empty();
						$.each(bitacoras,function(i, bitacora){
							$('#cont_tbl').append(html(bitacora)).fadeIn(1000);
						});
						tmp_m = _.template($('#tmp_fila_bitacora_listener').html());
						$('#div_cont_bitacoras').append(tmp_m);
					}else{

						$('#error').html('No se encontraron bítacoras.').fadeIn(1000).fadeOut(4000);
						$('#cont_tbl').empty();
						$.post('/bitacoras/getBitacorasAll',{},function(bitacoras){
							if(bitacoras.length<=0){
								return;
							}

							var tmp_m = $('#tmp_fila_bitacora').html();
							html = Handlebars.compile(tmp_m);
							$('#cont_tbl').empty();
							$.each(bitacoras,function(i, bitacora){
								$('#cont_tbl').append(html(bitacora)).fadeIn(1000);
							});
							tmp_m = _.template($('#tmp_fila_bitacora_listener').html());
							$('#div_cont_bitacoras').append(tmp_m);
						});

					}
				});
			},
			cont_extraer:function(){
				tmp = _.template($('#tmp_extraer_bitacoras').html());
				$('#div_cont_bitacoras').html(tmp).fadeIn(1000);
				$('#cont-extraer-bitacora').fadeIn(1000);

					this.getBitacorasAll();
					$('#txtBuscarBit').bind('textchange',function(){
					$('#txtBuscarBit').change();
				});
			},
			habilitarBtn :function(){
				chk = $('.chk:checked').length;
				console.log(chk);
				if(chk>0){
					document.getElementById('btnExtraer').disabled = false;
				}else{

					document.getElementById('btnExtraer').disabled = true;
				}
			}
	});
	return new BitacoraView();
});