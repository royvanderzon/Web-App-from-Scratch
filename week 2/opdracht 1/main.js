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

    "use strict";

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
            slackKeyInput: document.getElementById('slackKeyInput'), //token input
            liveSearch: document.getElementById('liveSearch'), //livesearch input
            removeButton: document.querySelectorAll('.delSearch')[0], //clear search input
            sorting: document.getElementById('sorting') //sorting selectbox
        },
        timeout: {
            //timeout for the delay of the Powned API
            pownedDelay: 2500
        },
        sort: {
            slack: 'email' // email | reverse | name | color
        },
        scroll: {
            lastId: '',
            //autoplay on start
            autoplay: true,
            disableBtn: false
        }
    }

    var dataSet = {
        //dynamic ajax call
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
                    // Success ajax call!
                    var data = JSON.parse(request.responseText);
                    if (typeof requestObj.cb === 'function') {
                        requestObj.cb(false, data);
                    }
                } else {
                    // Success connection but no data or error page
                    if (typeof requestObj.cb === 'function') {
                        console.log(request.status);
                        if (request.status == 429) {
                            requestObj.cb('request_denied', false);
                        } else {
                            requestObj.cb(true, false);
                        }
                    }
                }
            };
            request.onerror = function() {
                // Connection error
                if (typeof requestObj.cb === 'function') {
                    // requestObj.cb(true, false);
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
            //map through members and return where id = e.id
            return array[array.map(function(e) {
                return e.id;
            }).indexOf(id)]
        },
        sortData: function(filtering, data) {
            switch (filtering) {
                case 'reverse':
                    data.reverse()
                    break;
                case 'name':
                    data.sort(function(a, b) {
                        if (String(a.profile.last_name).toLowerCase() < String(b.profile.last_name).toLowerCase()) return -1;
                        if (String(a.profile.last_name).toLowerCase() > String(b.profile.last_name).toLowerCase()) return 1;
                        return 0;
                    })
                    break;
                case 'color':
                    data.sort(function(a, b) {
                        if (a.color < b.color) return -1;
                        if (a.color > b.color) return 1;
                        return 0;
                    })
                    break;
                case 'email':
                    data.sort(function(a, b) {
                        if (String(a.profile.email).toLowerCase() < String(b.profile.email).toLowerCase()) return -1;
                        if (String(a.profile.email).toLowerCase() > String(b.profile.email).toLowerCase()) return 1;
                        return 0;
                    })
                    break;
                default:
                    //nothing happens
            }
            return data
        },
        makePownedRequest: function(resolve, reject, email, id, index) {
            //function that calls an AJAX call and responds to an promiss
            return function() {
                setTimeout(function() {
                        var requestObj = {
                                requestType: 'GET', //GET | POST
                                // url: 'https://haveibeenpwned.com/api/v2/breachedaccount/test@gmail.com', //request url
                                url: 'https://haveibeenpwned.com/api/v2/breachedaccount/' + email, //request url
                                cb: function(err, data) {

                                    //clockfunction to keep track of the current position of the PownRequests
                                    scroll.loop(id)

                                    if (err == 'request_denied') {
                                        //this request was denied
                                        document.getElementById('slack_' + id).classList.add('request_denied')
                                        resolve({
                                            hacked: false,
                                            id: id,
                                            email: email,
                                            data: false,
                                            response: 'request_denied'
                                        })
                                    } else if (err) {
                                        //this email is not hacked
                                        document.getElementById('slack_' + id).classList.add('save')
                                        resolve({
                                            hacked: false,
                                            id: id,
                                            email: email,
                                            data: false,
                                            response: 'save'
                                        })
                                    } else {
                                        //this email is hacked
                                        document.getElementById('slack_' + id).classList.add('hacked')
                                        resolve({
                                            hacked: true,
                                            id: id,
                                            email: email,
                                            data: data,
                                            response: 'hacked'
                                        })
                                    }
                                }
                            }
                            //request 
                        dataSet.request(requestObj)
                    }, (config.timeout.pownedDelay) * index) //this request is fired after default timeout * index of this object from array
            }()
        },
        handleSorting : function(data){

            var input = config.el.liveSearch.value
            //only compareStrings if there is a string to compare!
            if (input.length > 0) {
                data = data.filter(function(value, index) {
                    //loop through properties in obj first
                    for (var thisKey in value) {
                        if (value.hasOwnProperty(thisKey)) {
                            //if property is searchable
                            if (typeof value[thisKey] === 'string') {
                                //if property matches return it
                                if ((value[thisKey]).toLowerCase().indexOf((input).toLowerCase()) > -1) {
                                    return true
                                }
                            }
                        }
                    }
                    //this obj has nothing to do here!
                    return false
                })
            }
            data = dataSet.sortData(config.sort.slack, data);
            
            return data
        },
        //this function makes a promis with an AJAX call for every Slack user with an valid email, after that data is stored in localStorage
        mergePowned: function(data) {

            //hadles sorting, if some sort of sort or filter function is used this function handles that the order goes the same in the flow
            data = dataSet.handleSorting(data)

            // disable moving with mouse
            areWeSafe.disable('disable')
            // enable autoplay indicaton
            scroll.indication('enable')
            //array to store all promises filled with an ajax request (* timeout of index)
            var promises = [];
            //keep track of all skipped users
            var skipped_users = 0;
            //only use the users with an email
            data.filter(function(element) {
                    return (typeof element.profile.email === 'string' ? true : false)
                }).map(function(element, index) {
                    //map through all users that have an email
                    //make a promise of every valid user
                    //check if API call is already made
                    if(typeof element.hacked !== 'object'){
                        var _promise = new Promise(function(resolve, reject) {
                            //request function (Powned)
                            dataSet.makePownedRequest(resolve, reject, element.profile.email, element.id, (index-skipped_users))
                        })
                        //push the promise to the array
                        promises.push(_promise);
                    }else{
                        skipped_users++;
                    }
                    return element
                })
                //wait for all the promises to finish
            Promise.all(promises).then(function(values) {
                //get data from localStorage
                var usersData = storage.get('slackData')
                    //go trough every user from slack
                usersData.members.map(function(user) {
                        //set user.hacked with the data from the powned api
                        user.hacked = values.filter(function(value) {
                                //return the matching user
                                return user.id === value.id ? true : false
                            })[0]
                            //check if the user was hacked (if user.hacked === object)
                        if (typeof user.hacked === 'object') {
                            if (user.hacked.response == 'request_denied') {
                                //setup hackstring for searching
                                user.hackString = 'denied question'
                            } else if (user.hacked.hacked) {
                                //setup hackstring for searching
                                user.hackString = 'hacked danger '
                                    //build very complete hackstring with loads of data and parameters
                                user.hacked.data.forEach(function(val) {
                                    user.hackString += val.Name + ' ' + val.Domain + ' ' + val.Title + ' IsActive:' + val.IsActive + ' IsRetired:' + val.IsRetired + ' IsSpamList:' + val.IsSpamList + ' IsVerified:' + val.IsVerified
                                })
                            } else {
                                //setup hackstring for searching
                                user.hackString = 'success safe'
                            }
                        } else {
                            //setup hackstring for searching
                            user.hackString = 'question noindex not found notfound'
                        }
                    })
                    // enable moving with mouse
                areWeSafe.disable('enable')
                    // disable autoplay indicaton
                scroll.indication('disable')
                    // after all merging store the data for re-use
                storage.set('slackData', usersData)
            }, function(reason) {
                console.log(reason)
            })
        }
    }

    var storage = {
        //check if there is already something stored
        defined: function(name) {
            return typeof localStorage[name] === 'undefined' ? false : true
        },
        //get something from localStorage
        get: function(name) {
            return JSON.parse(localStorage[name])
        },
        //set something in localStorage
        set: function(name, data) {
            localStorage[name] = JSON.stringify(data)
        }
    }

    var scroll = {
        init: function() {
            //start microlibrary
            smoothScroll.init()
                //event on autoplaybutton
            config.el.autoplay.addEventListener("click", scroll.toCurrent, false)
        },
        //scroll to element in DOM
        to: function(el) {
            var anchor = document.querySelector(el);
            var options = {
                    easing: "easeInOutCubic",
                    offset: 200,
                    //sync with the timeout of PownRequest Delay
                    speed: config.timeout.pownedDelay - 200,
                }
                //scroll to 'el' with options as config
            smoothScroll.animateScroll(anchor, false, options);
        },
        //fires every time when a PownRequest finishes
        loop: function(id) {
            //reset disableBtn after loop
            config.scroll.disableBtn = false
            config.el.autoplay.classList.remove('disableBtn')
                //handle breakout
            scroll.breakOut(id)
        },
        breakOut: function(id) {
            //calc height between view and client top  
            var offsetTop = document.documentElement.scrollTop || document.body.scrollTop
            var playPosition = templates.getOffset('#slack_' + id).top
                //if the view in the client is anywhere near the current Slack user
            if (offsetTop - 1000 < playPosition && offsetTop + 1000 > playPosition) {
                config.scroll.autoplay = true
                config.scroll.lastId = id
                if (config.scroll.autoplay) {
                    scroll.to('#slack_' + id)
                    scroll.showStop()
                } else {
                    scroll.showPlay()
                }
            } else {
                // if (true) {
                //     if (config.scroll.autoplay) {
                //         scroll.to('#slack_' + id)
                //         scroll.showStop()
                //     }
                // } else {
                    config.scroll.autoplay = false
                    scroll.showPlay()
                // }
            }

        },
        indication: function(state) {
            //disable|enable autoplay indication
            state == 'enable' ? config.el.autoplay.classList.remove('hidden') : config.el.autoplay.classList.add('hidden')
        },
        showPlay: function() {
            //show play button
            config.el.auto_play.classList.remove('hidden')
            if (!config.el.auto_stop.classList.contains('hidden')) {
                config.el.auto_stop.classList.add('hidden')
            }
        },
        showStop: function() {
            //show stop button
            config.el.auto_stop.classList.remove('hidden')
            if (!config.el.auto_play.classList.contains('hidden')) {
                config.el.auto_play.classList.add('hidden')
            }
        },
        toCurrent: function() {
            //scroll to current Slack user and start autoplay
            config.el.autoplay.classList.add('disableBtn')
            if (!config.scroll.disableBtn) {
                config.scroll.disableBtn = true
                if (config.scroll.autoplay) {
                    config.scroll.autoplay = false
                } else {
                    config.scroll.autoplay = true
                    setTimeout(function() {
                        config.scroll.autoplay = true
                    }, config.timeout.pownedDelay)
                    scroll.to('#slack_' + config.scroll.lastId)
                }
            }
        }
    }

    var templates = {
        getTemplateHtml: function(id) {
            //get html of an template
            return document.getElementById(id).innerHTML
        },
        renderTemplateUsersList: function(data) {

            //sort data
            data = dataSet.sortData(config.sort.slack, data);

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
                    if (person.hacked.response == 'request_denied') {
                        el.classList.add('request_denied')
                    } else if (person.hacked.hacked == true) {
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
            if (typeof person.hacked === 'object') {
                if (person.hacked.hacked == true) {
                    el.classList.add('hacked')
                    if (typeof person.profile.email === 'string') el.querySelectorAll("[data-mailto]")[0].href = 'mailto:' + person.profile.email + '?Subject=You%20are%20not%20save!&body=Check it out now, on localhost:3000! Here is your problem: ' + JSON.stringify(person.hacked.data)
                    if (person.hacked.data.length > 0) {
                        el.querySelectorAll(".domains")[0].classList.remove('hidden')
                        var html = '<li><strong>Hacked databases</strong></li>';
                        person.hacked.data.forEach(function(val) {
                            html += '<li>'
                            html += val.Name + ' - <a href="https://' + val.Domain + '" target=_black">' + val.Domain + '</a>'
                            html += '</li>'
                        })
                        el.querySelectorAll(".domains")[0].innerHTML = html
                    }
                } else {
                    if (person.hacked.response == 'request_denied') {
                        el.classList.add('request_denied')
                    } else {
                        el.classList.add('save')
                    }
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
            //get dom html of id
            return document.getElementById(id).innerHTML
        },
        checkAndEmpty: function(id) {
            //check if an dom element is empty
            var el = document.getElementById(id)
            if (el.innerHTML.length > 0) el.innerHTML = ''
        },
        checkAndRemove: function(id) {
            //check if el is empty, true -> remove inner content
            var el = document.getElementById(id)
            if (el !== null) el.parentNode.removeChild(el)
        },
        getOffset: function(el) {
            //get offset of element in dom
            el = document.querySelector(el).getBoundingClientRect()
            return {
                left: el.left + window.scrollX,
                top: el.top + window.scrollY
            }
        }
    }

    var sections = {
        toggle: function(route) {
            //toggle an route
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
        listen: function() {
            //router that listens to hashchange
            routie({
                '': function() {
                    search.clear()
                    sections.toggle('main-content')
                    templates.renderTemplateUsersList(storage.get('slackData').members)
                },
                'main-content': function() {
                    search.clear()
                    sections.toggle('main-content')
                    templates.renderTemplateUsersList(storage.get('slackData').members)
                },
                'members/:id': function(id) {
                    sections.toggle('members')
                    templates.renderTemplateUserSingle(dataSet.findMemberById(storage.get('slackData').members, id))
                }
            });
        }
    }

    var areWeSafe = {
        init: function() {
            //start eventlistener on button
            var el = document.getElementById('checkSafe')
            el.addEventListener("click", areWeSafe.event, false)
        },
        event: function() {
            //start mergePowned
            dataSet.mergePowned(storage.get('slackData').members)
        },
        disable: function(status) {
            //disable and enable 'are we safe' button
            status == 'disable' ? config.el.disable.classList.remove('hidden') : config.el.disable.classList.add('hidden')
        }
    }

    var search = {
        init: function() {
            //setup lisener on input and button search
            config.el.liveSearch.addEventListener("keyup", search.filterData)
            config.el.removeButton.addEventListener("click", search.refresh, false)
            config.el.sorting.addEventListener("change", search.sort, false)
        },
        refresh: function() {
            //clear all content and render original
            search.clear()
            search.toggleDelete('hide')
            templates.renderTemplateUsersList(storage.get('slackData').members)
        },
        clear: function() {
            //clear input value
            document.getElementById('liveSearch').value = ''
        },
        toggleDelete: function(state) {
            //toggle clear search input delete button
            var removeButton = document.querySelectorAll('.delSearch')[0]
            state == 'show' ? removeButton.classList.remove('hidden') : removeButton.classList.add('hidden')
        },
        filterData: function() {
            //filter data that matches the criteria of the serach input
            //get input
            var input = this.value
            if (input.length < 1) {
                search.toggleDelete('hide')
                templates.renderTemplateUsersList(storage.get('slackData').members)
            } else {
                search.toggleDelete('show')
                //compare and render to DOM
                search.compareSearchString(input)
            }
        },
        //for sorting
        sort: function(e) {
            var input = config.el.liveSearch.value
            config.sort.slack = String(this.value)
            //only compareStrings if there is a string to compare!
            if (input.length < 1) {
                search.toggleDelete('hide')
                templates.renderTemplateUsersList(storage.get('slackData').members)
            } else {
                search.toggleDelete('show')
                //compare and render to DOM
                search.compareSearchString(input)
            }
        },
        compareSearchString: function(input) {
            //render template with items with matching strings on input
            templates.renderTemplateUsersList(storage.get('slackData').members.filter(function(value, index) {
                //loop through properties in obj first
                for (var thisKey in value) {
                    if (value.hasOwnProperty(thisKey)) {
                        //if property is searchable
                        if (typeof value[thisKey] === 'string') {
                            //if property matches return it
                            if ((value[thisKey]).toLowerCase().indexOf((input).toLowerCase()) > -1) {
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

    var token = {
        init: function() {
            //listen to token button and check if there is already data in localStorage
            config.el.newtoken.addEventListener("click", token.ask, false)
            if (storage.defined('slackKey')) {
                config.slackKey = storage.get('slackKey')
            }
            token.event()
        },
        ask: function(message) {
            //fire modal
            typeof message === 'string' ? config.el.message.innerHTML = message : config.el.message.innerHTML = ''
            config.el.enterKey.addEventListener("click", token.set, false)
            config.el.overlay.addEventListener("click", token.hide, false)
            config.el.modalContainer.classList.remove('hidden')
        },
        set: function() {
            //store token and fire loadData()
            token.validate(slackKeyInput.value, function() {
                config.el.modalContainer.classList.add('hidden')
                config.slackKey = slackKeyInput.value
                storage.set('slackKey', config.slackKey)
                app.loadData()
            })
        },
        validate: function(token, cb) {
            //validates the token
            if (typeof cb === 'function') {
                cb()
            }
        },
        hide: function() {
            //hide modal
            config.el.modalContainer.classList.add('hidden')
        },
        event: function() {
            //listen to token button
            var el = document.getElementById('refresh')
            el.addEventListener("click", token.changed, false)
        },
        changed: function() {
            //load new data
            app.loadData()
        }
    }

    var app = {
        init: function() {
            //init all functions
            scroll.init()
            token.init()
            search.init()
            areWeSafe.init()
                //check slack data is already present
            if (!storage.defined('slackData')) {
                //ask token
                token.ask()
            } else {
                //init (customized) routie
                routes.listen()
            }
        },
        loadData: function() {
            //get new data and load it!
            var waitSlack = new Promise(function(resolve, reject) {
                //get Slack user with token
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
                        //push extra test account
                        data.members.push(testAccount)
                        resolve(data)
                    }
                })
            })
            waitSlack.then(function(data) {
                //store slack data
                storage.set('slackData', data)
                routes.listen()
            }).catch(function(err) {
                console.log(err)
                console.log('something went wrong..')
                token.ask(err + ', please check your internet connection and re-type your Slack token!')
                return
            })

        }
    }

    app.init()

}());
