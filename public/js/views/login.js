define(['text!templates/login.html',"views/index" ,'backbone'],function(loginTemplate, viewIndex, Backbone){
	loginView=Backbone.View.extend({
		el : $('#content'),
		events:{
			'click #btnLogin':'ingresar'
		},
		ingresar:function(){

			$('#error').empty().hide();
			var mail = $('input[name=mail]').val(),
				pass = $('input[name=pass]').val();

			if(mail&&pass){}else{
				$('#error').fadeIn('slow').text('Ingrese sus datos.').fadeOut(2000);
				return;
			}

			$.post('/login',{
				mail:mail,
				pass:pass
			},function(data){
				if(data){
					$('#exito').fadeIn('slow').text('Bienvenido...');
					window.location.hash="index";
				}else{
					$('#error').fadeIn('slow').text('Usuario/contraseña no coinciden.').fadeOut(2000);
				}
			});
			return false;
		},
		render:function(){
			$('#header').empty();
			this.$el.html(loginTemplate);
			$('#error').hide();
		}

	});

	return new loginView();
});