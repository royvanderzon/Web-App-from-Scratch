(function() {

    var dataSet = {
        request: function(requestObj) {

            // var requestObj = {
            //     requestType: String, //GET | POST
            //     url: String, //request url
            //     queryString : String, //*optional* queryString 'name=John&age=15&...'
            //     cb: Function(err,data) //callback
            // }

            var request = new XMLHttpRequest();

            typeof requestObj.queryString === 'string' ? requestObj.queryString = '?' + requestObj.queryString : requestObj.queryString = '';

            request.open(requestObj.requestType, requestObj.url + requestObj.queryString, true);
            request.onload = function() {
                if (request.status >= 200 && request.status < 400) {
                    // Success!
                    var data = JSON.parse(request.responseText);
                    if (typeof requestObj.cb === 'function') {
                        requestObj.cb(false, data);
                    }
                } else {
                    // We reached our target server, but it returned an error
                    if (typeof requestObj.cb === 'function') {
                        requestObj.cb('error status: ' + request.status, data);
                    }
                }
            };
            request.onerror = function() {
                // There was a connection error of some sort
                if (typeof requestObj.cb === 'function') {
                    requestObj.cb(true, data);
                }
            };
            request.send();
        },
        findMemberById: function(array, id) {
            return array[array.map(function(e) {
                return e.id;
            }).indexOf(id)]
        }
    }

    var storage = {
        defined: function(name) {
            return typeof localStorage[name] === 'undefined' ? false : true
        },
        get: function(name) {
            return JSON.parse(localStorage[name])
        },
        set: function(name, data) {
            localStorage[name] = JSON.stringify(data)
        }
    }

    var templates = {
        getTemplateHtml: function(id) {
            return document.getElementById(id).innerHTML
        },
        renderTemplateUsersList: function(data) {
            //check if element exists, if true -> reset
            templates.checkAndRemove('usersList')
                //create div and add classes
            var el = document.createElement('div')
            el.classList.add('usersList')
            el.id = 'usersList'
                //append el
            document.getElementById("usersListContainer").appendChild(el)

            //add users from data
            data.forEach(function(person) {
                //get template
                var template = templates.getTemplateHtml('userListItem')
                var el = document.createElement('article')
                el.classList.add('signleUser')
                el.innerHTML = template
                    //assign variables
                if (typeof person.color === 'string') el.style.borderColor = '#' + person.color
                if (typeof person.profile.email === 'string') el.querySelectorAll("[data-email]")[0].innerHTML += (person.profile.email)
                if (typeof person.profile.first_name === 'string' && typeof person.profile.last_name === 'string') el.querySelectorAll("[data-name]")[0].innerHTML += (person.profile.first_name + ' ' + person.profile.last_name)
                if (typeof person.profile.image_48 === 'string') el.querySelectorAll("[data-avatar]")[0].setAttribute('src', person.profile.image_48)
                el.querySelectorAll("[data-link]")[0].setAttribute('href', '#members/' + person.id)

                //append single user to the usersListContainer
                document.getElementById("usersList").appendChild(el)
            });
        },
        renderTemplateUserSingle: function(person) {
            //check if element exists, if true -> empty
            templates.checkAndRemove('singleUserContainer')

            var template = templates.getTemplateHtml('singleUser')
            var el = document.createElement('div')
            el.id = 'singleUserContainer'
            el.innerHTML = template

            if (typeof person.color === 'string') el.querySelectorAll("article")[0].style.borderColor = '#' + person.color
            if (typeof person.profile.email === 'string') el.querySelectorAll("[data-email]")[0].innerHTML += (person.profile.email)
            if (typeof person.profile.first_name === 'string') el.querySelectorAll("[data-name]")[0].innerHTML += (person.profile.first_name + ' ' + person.profile.last_name)
            if (typeof person.profile.image_512 === 'string') el.querySelectorAll("[data-avatar]")[0].setAttribute('src', person.profile.image_192)

            var membersEl = document.getElementById("members")
            membersEl.appendChild(el)
        },
        getDomHtml: function(id) {
            return document.getElementById(id).innerHTML
        },
        checkAndEmpty: function(id) {
            var el = document.getElementById(id)
            if (el.innerHTML.length > 0) el.innerHTML = ''
        },
        checkAndRemove: function(id) {
            var el = document.getElementById(id)
            if (el !== null) el.parentNode.removeChild(el)
        }
    }

    var sections = {
        toggle: function(route) {
            var sections = document.querySelectorAll('section')
            sections.forEach(function(section, index, arr) {
                if (section.id == route) {
                    section.classList.remove('hidden')
                } else {
                    section.classList.add('hidden')
                }
            })
        }
    }

    var routes = {
        start: function() {
            routie({
                '': function() {
                    search.clear();
                    sections.toggle('main-content')
                    templates.renderTemplateUsersList(storage.get('slackData').members)
                },
                'main-content': function() {
                    sections.toggle('main-content')
                    console.log(templates.getDomHtml('usersListContainer').length)
                    if (templates.getDomHtml('usersListContainer').length < 1) templates.renderTemplateUsersList(storage.get('slackData').members)
                },
                'members/:id': function(id) {

                    sections.toggle('members')

                    var members = storage.get('slackData').members
                    templates.renderTemplateUserSingle(dataSet.findMemberById(members, id))

                }
            });
        }
    };

    var search = {
        init: function() {
            var el = document.getElementById('liveSearch')
            var removeButton = document.querySelectorAll('.delSearch')[0]
            el.addEventListener("keyup", search.filterData)
            removeButton.addEventListener("click", search.refresh, false)
        },
        refresh: function() {
            search.clear()
            search.toggleDelete('hide')
            templates.renderTemplateUsersList(storage.get('slackData').members)
        },
        clear: function() {
            document.getElementById('liveSearch').value = ''
        },
        toggleDelete: function(state) {
            var removeButton = document.querySelectorAll('.delSearch')[0]
            state == 'show' ? removeButton.classList.remove('hidden') : removeButton.classList.add('hidden')
        },
        filterData: function() {
            //get input
            var input = this.value;
            if (input.length < 1) {
                search.toggleDelete('hide')
                templates.renderTemplateUsersList(storage.get('slackData').members)
            } else {
                search.toggleDelete('show')
                    //render template but filter on input first
                templates.renderTemplateUsersList(storage.get('slackData').members.filter(function(value, index) {
                    //loop through properties in obj first
                    for (var key in value) {
                        if (value.hasOwnProperty(key)) {
                            //if property is searchable
                            if (typeof value[key] === 'string') {
                                //if property matches return it
                                if ((value[key]).toLowerCase().indexOf((input).toLowerCase()) > -1) {
                                    return true
                                }
                            }
                        }
                    }
                    //this obj has nothing to do here!
                    return false
                }))
            }
        }
    }

    var app = {
        init: function() {
            //init search
            search.init()
                //check slack data is already present
            if (!storage.defined('slackData')) {
                app.getSlackData()
            } else {
                //init (customized) routie
                routes.start()
                    // console.log(storage.get('slackData'))
            }
        },
        getSlackData: function() {
            //request slack data from API
            dataSet.request({
                requestType: 'POST',
                url: 'https://slack.com/api/users.list',
                queryString: 'token=xoxp-13771535971-137383130642-138627124852-01c06483809a46e8473d990bbc2841c2',
                cb: function(err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(data)
                        storage.set('slackData', data)
                        routes.start()
                    }
                }
            });
        }
    }

    app.init();





}());
