define(['router'], function(router){


	var initialize = function() {
    checkLogin(runApplication);
  };

  var checkLogin = function(callback) {
    $.ajax('/cuenta/autenticado', {
      method: "GET",
      success: function() {console.log('Estas logeado!');
        return callback(true);
      },
      error: function(data) {console.log('No estas logeado.');
        return callback(false);
      }
    });
  };
  var runApplication = function(authenticated) {
    if (!authenticated) {
      window.location.hash = 'login';
    } else {
      window.location.hash = 'index';
    }
    Backbone.history.start();
  };
	//function
	return{
		initialize:initialize
	};
});