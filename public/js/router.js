define(['views/index','views/login','views/articulo','views/actividad', 'views/cliente','views/bitacora', 'views/historial' , 'backbone'],
	function(indexView,loginView, articuloView, actividadView, clienteView, bitacoraView, historialView ,Backbone){

		App_Router = Backbone.Router.extend({

			actual:loginView,
			routes:{
				'index':'index',
				'login':'login',
				'Bitacoras': 'bitacoras',
				'Actividades': 'actividades',
				'Articulos':'articulos',
				'Inventario':'inventario',
				'Clientes' : 'clientes',
				'Historial': 'historial',
				'Salir':'salir'
			},
			index:function(){

				this.undelegateEvents();
				this.actual  = indexView;
				this.actual.delegateEvents(); //ACTIVA EVENTOS DENUEVO.
				$.post('/cuenta/me',{},function(data){
						indexView.model = data;
						indexView.render();
				});
			},
			login:function(){
				this.undelegateEvents();
				this.actual = loginView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			salir:function(){
				$.post("/cuenta/salir",{},function(data){
					if(data===true){
						//salí.
					}else{
						//error AJAX.
					}
				});
				this.undelegateEvents();
				this.actual = loginView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			bitacoras: function(){
				this.undelegateEvents();
				this.actual = bitacoraView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			actividades: function(){
				this.undelegateEvents();
				this.actual = actividadView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			articulos:function(){
				this.undelegateEvents();
				this.actual = articuloView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			inventario:function(){

			},
			clientes : function(){
				this.undelegateEvents();
				this.actual = clienteView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			historial: function(){
				this.undelegateEvents();
				this.actual = historialView;
				this.actual.delegateEvents();
				this.actual.render();
			},
			undelegateEvents:function(){
				loginView.undelegateEvents();
				indexView.undelegateEvents();
				articuloView.undelegateEvents();
				actividadView.undelegateEvents();
				bitacoraView.undelegateEvents();
				clienteView.undelegateEvents();
			}
		});

		return new App_Router();
});