
'use strict';

(function(){

	var app = {
		init : function(){
			routes.init()
		}
	};

	var routes = {
		init : function(){

			window.addEventListener("hashchange",function(event){
				// sections.toggle((document.URL).split('#')[1]);
				sections.toggle(window.location.hash);
			});

		}
	};

	var sections = {
		toggle : function(route){
			var sections = document.querySelectorAll('section');
			sections.forEach(function(val, index, arr){
				console.log(val.id)
				console.log(route)
				if('#'+val.id == route){
					val.style.display = 'block';
				}else{
					val.style.display = 'none';
				}
				console.log(val)
			});
		}
	};

	app.init()

}());