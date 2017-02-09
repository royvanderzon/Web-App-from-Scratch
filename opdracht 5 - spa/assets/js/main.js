
'use strict';

(function(){

	var app = {
		init : function(){
			routes.init()
		}
	};

	var routes = {
		init : function(){
			
			window.onhashchange = function() {
		        sections.toggle(window.location.hash);
		    };

		}
	};

	var sections = {
		toggle : function(route){
			var sections = document.querySelectorAll('section');
			sections.forEach(function(val, index, arr){
				if('#'+val.id == route){
					val.classList.remove('hidden');
				}else{
					val.classList.add('hidden');
				}
				console.log(val)
			});
		}
	};

	app.init()

}());