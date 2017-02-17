//test account
var testAccount = {
    id: "fsdue992fe",
    team_id: "T42AYFZ2S",
    name: "Test account",
    deleted: false,
    status: null,
    color: "333333",
    real_name: "John Doe",
    tz: "Europe/Amsterdam",
    tz_label: "Central European Time",
    tz_offset: 3600,
    profile: {
        first_name: "John",
        last_name: "Doe",
        avatar_hash: "0d55c0413d69",
        image_24: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_24.png",
        image_32: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_32.png",
        image_48: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_48.png",
        image_72: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_72.png",
        image_192: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_192.png",
        image_512: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_192.png",
        image_1024: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_192.png",
        image_original: "https://avatars.slack-edge.com/2017-02-06/138379227990_0d55c0413d69d3851f46_original.png",
        real_name: "John Doe",
        real_name_normalized: "John Doe",
        email: "test@gmail.com"
            // email: "test@gmail.com"
    },
    is_admin: false,
    is_owner: false,
    is_primary_owner: false,
    is_restricted: false,
    is_ultra_restricted: false,
    is_bot: false,
    has_2fa: false
};

(function() {

    var config = {
        slackKey: 'key',
        el: {
            newtoken: document.querySelectorAll('.newtoken')[0], //submit request new token
            overlay: document.querySelectorAll('.overlay')[0], //overlay in modal
            modalContainer: document.querySelectorAll('.modal-container')[0], //modal container
            message: document.querySelectorAll('.message')[0], //err message token modal
            enterKey: document.querySelectorAll('.enterKey')[0], //submit token input
            disable: document.querySelectorAll('.disable')[0], //disable overlay
            autoplay: document.querySelectorAll('.autoplay')[0], //autoplay h4 element
            auto_stop: document.querySelectorAll('.auto_stop')[0], //stop incidation
            auto_play: document.querySelectorAll('.auto_play')[0], //start indication
            slackKeyInput: document.getElementById('slackKeyInput') //token input
        },
        timeout: {
            pownedDelay: 2500
        },
        scroll : {
            lastId : '',
            autoplay : true,
            disableBtn : false
        }
    }

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
                    console.log(request.status);
                    requestObj.cb(true, false);
                }
            };
            request.send();
        },
        getSlackData: function(cb) {
            //request slack data from API
            dataSet.request({
                requestType: 'POST',
                url: 'https://slack.com/api/users.list',
                queryString: 'token=' + config.slackKey,
                cb: cb
            });
        },
        findMemberById: function(array, id) {
            return array[array.map(function(e) {
                return e.id;
            }).indexOf(id)]
        },
        makePownedRequest: function(resolve, reject, email, id, index) {


            return function() {

                setTimeout(function() {

                    var requestObj = {
                            requestType: 'GET', //GET | POST
                            // url: 'https://haveibeenpwned.com/api/v2/breachedaccount/test@gmail.com', //request url
                            url: 'https://haveibeenpwned.com/api/v2/breachedaccount/' + email, //request url
                            cb: function(err, data) {

                                scroll.loop(id)

                                if (err) {
                                    //this email is not hacked
                                    document.getElementById('slack_' + id).classList.add('save')
                                    resolve({
                                        hacked: false,
                                        id: id,
                                        email: email,
                                        data: false
                                    })
                                } else {
                                    //this email is hacked
                                    document.getElementById('slack_' + id).classList.add('hacked')
                                    resolve({
                                        hacked: true,
                                        id: id,
                                        email: email,
                                        data: data
                                    })
                                }
                            }
                        }
                        //request 
                    dataSet.request(requestObj)

                }, (config.timeout.pownedDelay) * index)


            }()
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

    var scroll = {
        init : function(){
            smoothScroll.init()
            config.el.autoplay.addEventListener("click", scroll.toCurrent, false)
        },
        to: function(el) {
            var anchor = document.querySelector(el);
            var options = {
                easing: "easeInOutCubic",
                offset: 200,
                speed: config.timeout.pownedDelay - 200,
            }
            smoothScroll.animateScroll(anchor, false, options);
        },
        loop : function(id){
            //reset disableBtn after loop
            config.scroll.disableBtn = false
            config.el.autoplay.classList.remove('disableBtn')
            //handle breakout
            scroll.breakOut(id)
        },
        breakOut: function(id) {


                var offsetTop = document.documentElement.scrollTop || document.body.scrollTop
                var playPosition = templates.getOffset('#slack_' + id).top

                if (offsetTop - 1000 < playPosition && offsetTop + 1000 > playPosition) {
                    config.scroll.lastId = id
                    if(config.scroll.autoplay){
                        scroll.to('#slack_' + id)
                        scroll.showStop()
                    }else{
                        scroll.showPlay()
                    }
                } else {
                    config.scroll.autoplay = false
                    scroll.showPlay()
                }

        },
        indication: function(state) {
            state == 'enable' ? config.el.autoplay.classList.remove('hidden') : config.el.autoplay.classList.add('hidden')
        },
        showPlay: function() {
            config.el.auto_play.classList.remove('hidden')
            if (!config.el.auto_stop.classList.contains('hidden')) {
                config.el.auto_stop.classList.add('hidden')
            }
        },
        showStop: function() {
            config.el.auto_stop.classList.remove('hidden')
            if (!config.el.auto_play.classList.contains('hidden')) {
                config.el.auto_play.classList.add('hidden')
            }
        },
        toCurrent : function(){
            config.el.autoplay.classList.add('disableBtn')
            if(!config.scroll.disableBtn){
                config.scroll.disableBtn = true
                if(config.scroll.autoplay){
                    config.scroll.autoplay = false
                }else{
                    config.scroll.autoplay = true
                    setTimeout(function(){
                        config.scroll.autoplay = true
                    },config.timeout.pownedDelay)
                    scroll.to('#slack_' + config.scroll.lastId)
                }
            }
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
                el.id = 'slack_' + person.id
                el.classList.add('signleUser')
                el.innerHTML = template

                if (typeof person.hacked === 'object') {
                    if (person.hacked.hacked == true) {
                        el.classList.add('hacked')
                    } else {
                        el.classList.add('save')
                    }
                } else {
                    el.classList.add('no-email')
                }

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

            // console.log(person)

            if (typeof person.hacked === 'object') {
                if (person.hacked.hacked == true) {
                    el.classList.add('hacked')
                    if (typeof person.profile.email === 'string') el.querySelectorAll("[data-mailto]")[0].href = 'mailto:' + person.profile.email + '?Subject=You%20are%20not%20save!&body=Check it out now, on localhost:3000! Here is your problem: ' + JSON.stringify(person.hacked.data)
                    if (person.hacked.data.length > 0) {
                        el.querySelectorAll(".domains")[0].classList.remove('hidden')
                        html = '<li><strong>Hacked databases</strong></li>';
                        person.hacked.data.forEach(function(val) {
                            // console.log(val)
                            html += '<li>'
                            html += val.Name + ' - <a href="https://' + val.Domain + '" target=_black">' + val.Domain + '</a>'
                            html += '</li>'
                        })
                        el.querySelectorAll(".domains")[0].innerHTML = html
                            // el.querySelectorAll("xmp")[0].innerHTML = JSON.stringify(person.hacked.data)
                    }
                } else {
                    el.classList.add('save')
                    if (typeof person.profile.email === 'string') el.querySelectorAll("[data-mailto]")[0].href = 'mailto:' + person.profile.email + '?Subject=You%20are%20safe!&body=Check it out now, on localhost:3000!'
                }
            } else {
                el.classList.add('no-email')
                if (typeof person.profile.email === 'string') el.querySelectorAll("[data-mailto]")[0].href = 'mailto:' + person.profile.email + '?Subject=Are%20we%20safe?&body=Check it out now, on localhost:3000!'
            }

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
        },
        getOffset: function(el) {
            el = document.querySelector(el).getBoundingClientRect()
            return {
                left: el.left + window.scrollX,
                top: el.top + window.scrollY
            }
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
                    search.clear()
                    sections.toggle('main-content')
                    templates.renderTemplateUsersList(storage.get('slackData').members)
                },
                'main-content': function() {
                    // sections.toggle('main-content')
                    // console.log(templates.getDomHtml('usersListContainer').length)
                    // if (templates.getDomHtml('usersListContainer').length < 1) templates.renderTemplateUsersList(storage.get('slackData').members)
                    search.clear()
                    sections.toggle('main-content')
                    templates.renderTemplateUsersList(storage.get('slackData').members)
                },
                'members/:id': function(id) {

                    sections.toggle('members')

                    var members = storage.get('slackData').members
                    templates.renderTemplateUserSingle(dataSet.findMemberById(members, id))

                }
            });
        }
    }

    var changeKey = {
        init: function() {
            var el = document.getElementById('refresh')
            el.addEventListener("click", changeKey.changed, false)
        },
        changed: function() {
            app.loadData()
        }
    }

    var areWeSave = {
        init: function() {
            var el = document.getElementById('checkSafe')
            el.addEventListener("click", areWeSave.start, false)
        },
        start: function() {
            app.mergePowned(storage.get('slackData').members)
        },
        disable: function(status) {
            status == 'disable' ? config.el.disable.classList.remove('hidden') : config.el.disable.classList.add('hidden')
        }
    }

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

    var token = {
        init: function() {
            config.el.newtoken.addEventListener("click", token.ask, false)
            if (storage.defined('slackKey')) {
                config.slackKey = storage.get('slackKey')
            }
        },
        ask: function(message) {
            typeof message === 'string' ? config.el.message.innerHTML = message : config.el.message.innerHTML = ''
            config.el.enterKey.addEventListener("click", token.set, false)
            config.el.overlay.addEventListener("click", token.hide, false)
            config.el.modalContainer.classList.remove('hidden')
        },
        set: function() {
            // config.slackKey = slackKeyInput.value
            token.validate(slackKeyInput.value, function() {
                config.el.modalContainer.classList.add('hidden')
                config.slackKey = slackKeyInput.value
                storage.set('slackKey', config.slackKey)
                app.loadData()
            })
        },
        validate: function(token, cb) {

            if (typeof cb === 'function') {
                cb()
            }
        },
        hide: function() {
            config.el.modalContainer.classList.add('hidden')
        }
    }

    var app = {
        init: function() {

            //start smooth scroll
            scroll.init()

            token.init()
            search.init()
            changeKey.init()
            areWeSave.init()
                //check slack data is already present
            if (!storage.defined('slackData')) {
                //ask token
                token.ask()
            } else {
                //init (customized) routie
                routes.start()
            }
        },
        loadData: function() {

            var waitSlack = new Promise(function(resolve, reject) {
                dataSet.getSlackData(function(err, data) {
                    // console.log(data)
                    if (err) {
                        console.log(err)
                        reject('Failure!')
                    } else {
                        if (data.error) {
                            console.log(data)
                            console.log(config.slackKey)
                            token.ask(data.error + ' please, re-issue your slack token!')
                            return
                        }
                        data.members.push(testAccount)
                        resolve(data)
                    }
                })
            })

            waitSlack.then(function(data) {

                storage.set('slackData', data)
                routes.start()

                // app.mergePowned(data);

            }).catch(function(err) {
                console.log(err)
                console.log('something went wrong..')
            })

        },
        mergePowned: function(data) {

            // disable moving with mouse
            areWeSave.disable('disable')
            // enable autoplay indicaton
            scroll.indication('enable')

            var promises = [];
            data.filter(function(element) {
                return (typeof element.profile.email === 'string' ? true : false)
            }).map(function(element, index) {

                var _promise = new Promise(function(resolve, reject) {
                    // setTimeout(resolve, 1000, element.profile.email)
                    // dataSet.makePownedRequest(resolve, reject,index)
                    dataSet.makePownedRequest(resolve, reject, element.profile.email, element.id, index)
                })
                promises.push(_promise);
                // promises.push(dataSet.makePownedRequest(resolve, reject,element.profile.email))
                return element
            })

            Promise.all(promises).then(function(values) {

                //get data from localStorage
                var usersData = storage.get('slackData')

                usersData.members.map(function(user) {
                        user.hacked = values.filter(function(value) {
                            return user.id === value.id ? true : false
                        })[0]
                        if (typeof user.hacked === 'object') {
                            if (user.hacked.hacked) {
                                user.hackString = 'hacked danger '
                                user.hacked.data.forEach(function(val) {
                                    user.hackString += val.Name + ' ' + val.Domain + ' ' + val.Title + 'IsActive:' + val.IsActive + ' IsRetired:' + val.IsRetired + ' IsSpamList:' + val.IsSpamList + ' IsVerified:' + val.IsVerified
                                })
                            } else {
                                user.hackString = 'success safe'
                            }
                        } else {
                            user.hackString = 'question noindex not found notfound'
                        }
                    })
                    // enable moving with mouse
                areWeSave.disable('enable')
                    // disable autoplay indicaton
                scroll.indication('disable')
                storage.set('slackData', usersData)

            }, function(reason) {
                console.log(reason)
            })

            routes.start()
        }
    }

    app.init()

}());
