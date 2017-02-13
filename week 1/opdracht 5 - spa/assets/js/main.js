(function() {

    'use strict';

    var app = {
        init: function() {
            routes.init()
        }
    };

    var routes = {
        init: function() {

            window.addEventListener("hashchange", function(event) {
                sections.toggle(window.location.hash);
            });

        }
    };

    var sections = {
        toggle: function(route) {
            var sections = document.querySelectorAll('section');
            sections.forEach(function(section, index, arr) {
                if ('#' + section.id == route) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        }
    };

    app.init()

}());
