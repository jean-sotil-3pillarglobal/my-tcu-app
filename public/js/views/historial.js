define(['text!templates/historial-index.html', 'backbone','underscore'], function(tmpHistorialIndex, Backbone, _){
		HistorialView = Backbone.View.extend({
			el:$('#content'),
			events:{
				'change #txtBuscar, #txtFec' :'getRegistros',
				'click #btnHistorial':'render',
				'change input[type="radio"]':'cambiar'
				//'change #txtBuscar' :'getCliente',
				//'click #btnGuardar':'guardar'
			},
			cambiar:function(){
				op = $('input[name="rbhistorial"]:checked').val();
				console.log(op.trim() == 'fec');
				if(op.trim() == 'fec'){
					$('#txtBuscar').fadeOut(1000);
					$('#txtBuscar').replaceWith("<input type='date' id='txtFec' value=''>");
					$('#txtFec').show(300);
				}else{
					$('#txtFec').fadeOut(1000);
					$('#txtFec').replaceWith("<input type='text' id='txtBuscar' value=''>");
					$('#txtBuxcar').show(300);
				}
				$('#txtBuscar').bind('textchange',function(){
					$('#txtBuscar').change();
				});
			},
			getRegistros:function(){
				$('#cont_tbl').empty();
				var txt = $('#txtBuscar').val();
				if(txt===""){
					this.getRegistrosAll();
					return;
				}

				$('#error').empty().hide();
				$('#exito').empty().hide();

				op = $('input[name="rbhistorial"]:checked').val();
				if(op=='nom'){
					console.log('nom');
					$.post('/historial/getRegistros_nombre',{nom:txt},function(registros){
						if(registros){
							tmp = $('#tmp_fila_log').html();
							tmp = Handlebars.compile(tmp);
							$('#cont_tbl').empty();
							$.each(registros, function(i, registro){
								$('#cont_tbl').append(tmp(registro));
							});
							$('#exito').html('Se encontraron registros').fadeIn(1000);
						}else{
							$('#error').html('No se encontraron registros').fadeIn(1000);
						}
					});
				}
				if(op=='fec'){
					console.log('fec');

					fec = $('#txtFec').val();
					fec =  fec.split('-');
					fec = fec[0]+'-'+parseInt(fec[1])+'-'+parseInt(fec[2]);

					$.post('/historial/getRegistros_fecha',{fec:fec},function(registros){
						if(registros){
							tmp = $('#tmp_fila_log').html();
							tmp = Handlebars.compile(tmp);
							$('#cont_tbl').empty();
							$.each(registros, function(i, registro){
								$('#cont_tbl').append(tmp(registro));
							});
							$('#exito').html('Se encontraron registros').fadeIn(1000);
						}else{
							
							$('#error').html(' No se encontraron registros en la fecha: '+ fec).fadeIn(1000);
							$.post('/historial/getRegistrosAll',{},function(registros){
								tmp = $('#tmp_fila_log').html();
								tmp = Handlebars.compile(tmp);
								$('#cont_tbl').empty();
								$.each(registros, function(i, registro){
									$('#cont_tbl').append(tmp(registro));
								});
							});
						}
					});
				}
				if(op=='desc'){
					console.log('desc');
					$.post('/historial/getRegistros_descripcion',{desc:txt},function(registros){
						if(registros){
							tmp = $('#tmp_fila_log').html();
							tmp = Handlebars.compile(tmp);
							$('#cont_tbl').empty();
							$.each(registros, function(i, registro){
								$('#cont_tbl').append(tmp(registro));
							});
							$('#exito').html('Se encontraron registros').fadeIn(1000);
						}else{
							$('#error').html('No se encontraron registros').fadeIn(1000);
						}
					});
				}
			},
			getRegistrosAll:function(){
				$.post('/historial/getRegistrosAll',{},function(registros){
					tmp = $('#tmp_fila_log').html();
					tmp = Handlebars.compile(tmp);
					$('#cont_tbl').empty();
					$.each(registros, function(i, registro){
						$('#cont_tbl').append(tmp(registro));
					});
				});
			},
			render:function(){

				this.$el.empty();
				this.$el.html(tmpHistorialIndex);
				tmp = _.template($('#tmp_gestion_historial').html());
				$('#div_cont_historial').html(tmp).fadeIn(2000);
				this.getRegistros();

				$('#txtBuscar').bind('textchange',function(){
					$('#txtBuscar').change();
				});

			}
		});
		return new HistorialView();
});