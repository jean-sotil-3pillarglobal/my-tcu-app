require.config({
	paths:{
		"backbone":"/js/libs/backbone-amd/backbone-min",
		"underscore":"/js/libs/underscore-amd/underscore",
		"jquery":"/js/libs/jquery/jquery",
		"templates":"../templates",
		"text":"/js/libs/text"
	},
	shim:{
		"backbone":["underscore","jquery"],
		"principal":['backbone']
	}
});


require(['principal'], function(principal){
	principal.initialize();
});

