var fs = require('fs');

CordAPI = 
{
    Logging: 
    {
        Log: function(text) { 
            console.log("%c[Cord%cware]", "color: navy", "color: teal", text);
        },
        Error: function(text) {
            console.info('%c[Cordware]', 'color: #ff0000', text); 
        },
        Success(text) { 
            console.info('%c[Cordware]', 'color: #00ff00', text); 
        }
    },
    Modding:
    {
        InjectedPlugins: [],
        GetPlugins: function() {
            return this.InjectedPlugins;
        },
        GetClientDirectory: function() {
            return process.env.ClientDirectory;
        },
        GetPluginsDirectory: function() {
            return `${process.env.ClientDirectory}\\Plugins`;
        },
        FilterWebpackModule: function(item)
        {
            var req = window.webpackJsonp.push([[], {'__extra_id__': (module, exports, req) => module.exports = req}, [['__extra_id__']]]);

            for (const in1 in req.c) {
                if (req.c.hasOwnProperty(in1)) {
                    const m = req.c[in1].exports;
                    if (m && m.__esModule && m.default && m.default[item]) return m.default;
                    if (m && m[item]) return m;
                }
            }
        },
        GlobalWebpackModule: function(module)
        {
            var req = window.webpackJsonp.push([[], {'__extra_id__': (module, exports, req) => module.exports = req}, [['__extra_id__']]]);

            for (let i in req.c) {
                if (req.c.hasOwnProperty(i)) {
                    let m = req.c[i].exports;
                    if (m && m.__esModule && m.default) {
                        for (let e in m.default) {
                            if (e.toLowerCase().includes(module.toLowerCase())) {
                                console.log(e, m.default);
                            };
                        };
                    };
                };
            };
        },
        NullPatchMethod: function(method, name)
        {
            try 
            {
                if (typeof method[name] == 'function') {
                    method[name] = function () { }
                } else {
                    CordAPI.Logging.Error(`Failed to Null Patch Method: ${name} because it's not a function!`);
                }
            }
            catch(err) {
                CordAPI.Logging.Error(`Failed to Null Patch Method: ${name}\nException: ${err}\nMake an issue report with this on the github.`);
            }
        },
        PatchMethod: function(method, name, override) 
        {
            try 
            {
                const original = method[name];
                method[name] = function () 
                {
                    const parameters = 
                    {
                        thisObject: this,
                        methodArguments: arguments,
                        originalMethod: original,
                        callOriginalMethod: () => parameters.returnValue = parameters.originalMethod.apply(parameters.thisObject, parameters.methodArguments)
                    };
                    return override(parameters);
                };
            }
            catch(err) 
            {
                CordAPI.Logging.Error(`Failed to Patch Method: ${name}\nException: ${err}\nMake an issue report with this on the github.`);
                return null;
            }     
        },
        LoadPlugin: function(path)
        {
            try 
            {
                var plugin = require(path);
                this.InjectedPlugins[plugin.Name] = plugin;
                this.InjectedPlugins[plugin.Name].OnInjection();
                CordAPI.Logging.Log(`Loaded ${plugin.Name} by ${plugin.Author} | ${plugin.Description}`);
            }
            catch (error) {
                CordAPI.Logging.Error(`Failed to load plugins\nException: ${error}\nMake an issue report with this on the github.`);
            }
        },
        LoadPlugins: function()
        {
            try 
            {
                var files = fs.readdirSync(this.GetPluginsDirectory());
                for(var i = 0; i < files.length; i++)
                {
                    var plugin = files[i];
                    if (plugin.includes(".cord.js")) {
                        this.LoadPlugin(`${this.GetPluginsDirectory()}\\${plugin}`);
                    }
                }
                CordAPI.Logging.Success("Loaded All Plugins");
            }
            catch (error) {
                CordAPI.Logging.Error(`Failed to load plugins\nException: ${error}\nMake an issue report with this on the github.`);
            }
        },
        FirePluginEvent: function(type, parameters)
        {
            try
            {
                for(var module in this.GetPlugins())
                {
                    var plugin = this.GetPlugins()[module];
                    if (plugin.OnEventCalled && typeof plugin.OnEventCalled == 'function') {
                        plugin.OnEventCalled(type, parameters);
                    }
                }
            }
            catch(err) {
                CordAPI.Logging.Error(`Failed to fire plugin event ${type} with ${parameters.length} parameter(s)\nException: ${err}\nMake an issue report with this on the github.`);
            }
        },
        HandlePluginEvents: function()
        {
            try 
            {
                var dispatch = CordAPI.Modding.FilterWebpackModule("dispatch");
                CordAPI.Modding.PatchMethod(dispatch, "dispatch", (result) => 
                {
                    var arguments = result.methodArguments[0];
                    var type = arguments.type;
                    this.FirePluginEvent(type, arguments);
                    return result.callOriginalMethod(result.methodArguments);
                });
            }
            catch(err) {
                CordAPI.Logging.Error(`Failed to handle plugin events\nException: ${err}\nMake an issue report with this on the github.`);
            }
        }
    },
    Requests:
    {
        MakeGetRequest(url, cors, authorization, callback)
        {
            var request = new XMLHttpRequest();
            request.addEventListener("load", () => {
                callback(request.responseText);
            });
            request.open("GET", `${cors ? `https://cors-anywhere.herokuapp.com/${url}` : url}`);
            if (authorization != "") {
                request.setRequestHeader("Authorization", authorization);
            }
            request.send();
        },
        MakePostRequest(url, body, authorization, json, callback)
        {
            var request = new XMLHttpRequest();
            request.addEventListener("load", () => {
                callback(request.responseText);
            });
            request.open("POST", url);
            if (json) {
                request.setRequestHeader("Content-Type", "application/json");
                if (authorization != "") {
                    request.setRequestHeader("Authorization", authorization);
                }
            }
            request.send(body);
        },
        MakeDeleteRequest(url, authorization, callback)
        {
            var request = new XMLHttpRequest();
            request.addEventListener("load", () => {
                callback(request.responseText);
            });
            request.open("DELETE", url);
            if (authorization != "") {
                request.setRequestHeader("Authorization", authorization);
            }
            request.send();
        }
    },
    UI:
    {
        InjectHTML(html) { 
            return document.createRange().createContextualFragment(html); 
        },
        FadeOut(element) 
        {
            var op = 1;
            var timer = setInterval(function () 
            {
                if (op <= 0.1)
                {
                    clearInterval(timer);
                    element.style.display = 'none';
                    element.remove();
                }

                element.style.opacity = op;
                element.style.filter = 'alpha(opacity=' + op * 100 + ")";
                op -= op * 0.1;
            }, 50);
        },
        CreateMenu(MenuID, MenuTitle, GreetingText, ButtonAddID, ImageURL, callback, height = "400px") 
        {
            var appMenu = document.getElementsByClassName(CordAPI.Modding.FilterWebpackModule('appMount').appMount)[0];
            var MenuBackdrop = this.InjectHTML(`<div id="${MenuID}"><div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); z-index: 1000; transform: translateZ(0px);"></div><div class="modal-3c3bKg" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1ilYF7" role="dialog" tabindex="-1" aria-modal="true" d=""><div class="wrapper-O5i5-0"><div class="modal-yWgWj- modal-1k91nT sizeSmall-1jtLQy fullscreenOnMobile-1aglG_"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1TKi98" style="flex: 0 0 auto;"><button aria-label="Close" type="button" id="CloseButton-${MenuID}" class="close-hZ94c6 closeButton-31ta9E button-38aScr lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN"><div class="contents-18-Yxp"><svg aria-hidden="false" width="24" height="24" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd" aria-hidden="true"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div></button><div class="headerContainer-3uxewi"><div class="header-2Pz98J"><h2 class="colorStandard-2KCXvj size14-e6ZScH h2-2gWE-o title-3sZWYQ defaultColor-1_ajX0 marginBottom8-AtZOdT" style="text-align: center;">${MenuTitle}</h2><center><div class="inviteRowAvatar-EURMT6 wrapper-3t9DeA" role="img" aria-hidden="false" style="width: 100px; height: 100px;"><svg width="40" height="32" viewBox="0 0 40 32" class="mask-1l8v16 svg-2V3M55" aria-hidden="true"><foreignObject x="0" y="0" width="32" height="32" mask="url(#svg-mask-avatar-default)"><img src="${ImageURL}" alt=" " class="avatar-VxgULZ" aria-hidden="true"></foreignObject></svg></div></center><h5 class="colorStandard-2KCXvj size14-e6ZScH h5-18_1nd title-3sZWYQ marginBottom8-AtZOdT" style="text-align: center;">${GreetingText}</h5></div></div></div><div class="scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerTrack-1ZIpsv"><div class="scroller-2hZ97C thin-1ybCId scrollerBase-289Jih" style="overflow: hidden scroll; padding-right: 0px; max-height: ${height}" id="${ButtonAddID}"></div></div></div></div></div></div></div>`);
            appMenu.appendChild(MenuBackdrop);
            document.getElementById('CloseButton-' + MenuID).addEventListener('click', (() => {
                this.FadeOut(document.getElementById(MenuID));
            }));
            callback();
        },
        AddMenuButtons(type) 
        {
            var elementHolster = document.getElementById('InsertMenuButtonsHere');
            switch (type) 
            {
                case "Settings":
                    elementHolster = document.getElementById('InsertSettingsButtonsHere');

                    this.AddMenuButton(elementHolster, "Mention Everyone", "Bypass the restriction on @everyone in any guild.", "https://webstockreview.net/images/clipart-phone-email-address-4.png", () => window.Secrets.TryMentionEveryone());
                break;
                case "Menu":
                    elementHolster = document.getElementById('InsertMenuButtonsHere');

                    this.AddMenuButton(elementHolster, "Configuration", "Here you can configure cordware and modify the configuration for some plugins.", "https://i.imgur.com/4b4h7Kq.png", () => 
                    {
                        this.FadeOut(document.getElementById("MainCordwareWindow"));
                        var CurrentUsertag = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().username + "#" + CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().discriminator;
                        this.CreateMenu("SettingsWindow", "Settings", `Cordware: Doing discord's job.<br>Welcome scientist, ${CurrentUsertag}`, "InsertSettingsButtonsHere", "https://i.imgur.com/FLdcbL8.gif", () => this.AddMenuButtons("Settings"));
                    });

                    this.AddMenuButton(elementHolster, "Plugins", "Here you can enable/disable cordware plugins you have installed.", "https://i.imgur.com/4PkPhhY.jpg", () => 
                    {
                        this.FadeOut(document.getElementById("MainCordwareWindow"));
                        this.CreateMenu("PluginsWindow", "Plugins", `The Laboratory.`, "InsertPluginButtonsHere", "https://i.imgur.com/8mOG9DM.gif", () => this.AddMenuButtons("Plugins"));
                    });
                break;
                case "Plugins":
                    elementHolster = document.getElementById('InsertPluginButtonsHere');
                    for(var module in CordAPI.Modding.GetPlugins())
                    {
                        var plugin = CordAPI.Modding.GetPlugins()[module];
                        this.AddMenuToggleButton(elementHolster, plugin.Name, plugin.Description, plugin.Logo, "Enabled", () => {
                            plugin.OnEjection();
                        }, () => {
                            plugin.OnInjection();
                        });
                    }
                break;
            }
        },
        AddMenuButton(Holster, ButtonTitle, ButtonDescription, ButtonIconURL, callback) 
        {
            if (document.getElementById(ButtonTitle)) return;
            var element = this.InjectHTML(`<div style="width: 90%" class="card-o7rAq- clickable-ya6Upc cardPrimaryEditable-3KtE4g card-3Qj_Yx"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><img alt="" src="${ButtonIconURL}" class="iconWrapper-lS1uig flexChild-faoVW3" style="flex: 0 0 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp alignStretch-DpGPf3 noWrap-3jynv6 wrapper-1sov8s" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><h3 class="secondaryHeader-2oeRPO base-1x0h_U size16-1P40sf">${ButtonTitle}</h3><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs wrap-ZIn9Iy" style="flex: 1 1 auto;"><div class="detailsWrapper-3XSaoN"><div class="colorHeaderSecondary-3Sp3Ft size12-3cLvbJ">${ButtonDescription}</div></div></div></div></div><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyEnd-2E6vba alignCenter-1dQNNs noWrap-3jynv6 flexChild-faoVW3" style="flex: 0 0 auto;" id="${ButtonTitle}"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6" style="flex: 1 1 auto;"><div class="colorStandard-2KCXvj size14-e6ZScH">Execute</div><svg class="caret-Ld-w32" aria-hidden="false" width="10" height="10" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><polygon fill="currentColor" fill-rule="nonzero" points="8.47 2 6.12 4.35 13.753 12 6.12 19.65 8.47 22 18.47 12"></polygon><polygon points="0 0 24 0 24 24 0 24"></polygon></g></svg></div></div></div></div>`);
            Holster.appendChild(element);
            var Button = document.getElementById(ButtonTitle);
            Button.addEventListener("click", () => callback());
        },
        AddMenuToggleButton(Holster, ButtonTitle, ButtonDescription, ButtonIconURL, Default = "Enabled", ToggleAction, UntoggleAction) 
        {
            if (document.getElementById(ButtonTitle)) return;

            if (Default == "Enabled") {
                var element = this.InjectHTML(`<div style="width: 90%" class="card-o7rAq- clickable-ya6Upc cardPrimaryEditable-3KtE4g card-3Qj_Yx"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><img alt="" src="${ButtonIconURL}" class="iconWrapper-lS1uig flexChild-faoVW3" style="flex: 0 0 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp alignStretch-DpGPf3 noWrap-3jynv6 wrapper-1sov8s" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><h3 class="secondaryHeader-2oeRPO base-1x0h_U size16-1P40sf">${ButtonTitle}</h3><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs wrap-ZIn9Iy" style="flex: 1 1 auto;"><div class="detailsWrapper-3XSaoN"><div class="colorHeaderSecondary-3Sp3Ft size12-3cLvbJ">${ButtonDescription}</div></div></div></div></div><div class="control-2BBjec" id="${ButtonTitle}"><div class="container-3auIfb" id="${ButtonTitle}-container" tabindex="-1" style="opacity: 1; background-color: rgb(67, 181, 129);"><svg class="slider-TkfMQL" id="${ButtonTitle}-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" style="left: 12px;"><rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg viewBox="0 0 20 20" fill="none"><path id="${ButtonTitle}-path1" fill="rgba(67, 181, 129, 1)" d="M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z"></path><path id="${ButtonTitle}-path2" fill="rgba(67, 181, 129, 1)" d="M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z"></path></svg></svg><input id="uid_238" type="checkbox" class="input-rwLH4i" tabindex="0" checked=""></div></div></div></div>`);
                Holster.appendChild(element);
            } 
            else {
                var element = this.InjectHTML(`<div style="width: 90%" class="card-o7rAq- clickable-ya6Upc cardPrimaryEditable-3KtE4g card-3Qj_Yx"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><img alt="" src="${ButtonIconURL}" class="iconWrapper-lS1uig flexChild-faoVW3" style="flex: 0 0 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp alignStretch-DpGPf3 noWrap-3jynv6 wrapper-1sov8s" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><h3 class="secondaryHeader-2oeRPO base-1x0h_U size16-1P40sf">${ButtonTitle}</h3><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs wrap-ZIn9Iy" style="flex: 1 1 auto;"><div class="detailsWrapper-3XSaoN"><div class="colorHeaderSecondary-3Sp3Ft size12-3cLvbJ">${ButtonDescription}</div></div></div></div></div><div class="control-2BBjec" id="${ButtonTitle}"><div class="container-3auIfb" id="${ButtonTitle}-container" tabindex="-1" style="opacity: 1; background-color: rgb(114, 118, 125);"><svg class="slider-TkfMQL" id="${ButtonTitle}-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet" style="left: -3px;"><rect fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg viewBox="0 0 20 20" fill="none"><path id="${ButtonTitle}-path1" fill="rgba(114, 118, 125, 1)" d="M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z"></path><path id="${ButtonTitle}-path2" fill="rgba(114, 118, 125, 1)" d="M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z"></path></svg></svg><input id="uid_85" type="checkbox" class="input-rwLH4i" tabindex="0" checked=""></div></div></div></div>`);
                Holster.appendChild(element);
            }

            var ToggleButton = document.getElementById(ButtonTitle);
            ToggleButton.addEventListener("click", () => 
            {
                var container = document.getElementById(`${ButtonTitle}-container`);
                var slider = document.getElementById(`${ButtonTitle}-slider`);
                var path1 = document.getElementById(`${ButtonTitle}-path1`);
                var path2 = document.getElementById(`${ButtonTitle}-path2`);

                if (path1.getAttribute("d") == "M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z" && path2.getAttribute("d") == "M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z") 
                {
                    container.style.backgroundColor = "rgb(114, 118, 125)";
                    slider.style.left = "-3px";
                    path1.setAttribute("d", "M5.13231 6.72963L6.7233 5.13864L14.855 13.2704L13.264 14.8614L5.13231 6.72963Z");
                    path2.setAttribute("d", "M13.2704 5.13864L14.8614 6.72963L6.72963 14.8614L5.13864 13.2704L13.2704 5.13864Z")
                    UntoggleAction();
                }
                else 
                {
                    container.style.backgroundColor = "rgb(67, 181, 129)";
                    slider.style.left = "12px";
                    path1.setAttribute("d", "M7.89561 14.8538L6.30462 13.2629L14.3099 5.25755L15.9009 6.84854L7.89561 14.8538Z");
                    path2.setAttribute("d", "M4.08643 11.0903L5.67742 9.49929L9.4485 13.2704L7.85751 14.8614L4.08643 11.0903Z")
                    ToggleAction();
                }
            });
        },
        OpenMenu() 
        {
            var CurrentUsertag = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().username + "#" + CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().discriminator;
            var PfpExtension = CordAPI.Modding.FilterWebpackModule('hasAnimatedAvatar').hasAnimatedAvatar(CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser()) ? "gif" : "png";
            var avatarImageURL = `https://cdn.discordapp.com/avatars/${CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id}/${CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().avatar}.${PfpExtension}`
            this.CreateMenu("MainCordwareWindow", "Cordware", `Welcome, ${CurrentUsertag}`, "InsertMenuButtonsHere", avatarImageURL, () => this.AddMenuButtons("Menu"));
        },
        AddMenuOpenerButton()
        {
            if (document.getElementById('MenuButton')) return;
            var holster = document.querySelector("#app-mount > div.app-1q1i1E > div > div.layers-3iHuyZ.layers-3q14ss > div > div > div > div > div.sidebar-2K8pFh > section > div.container-3baos1 > div.flex-1xMQg5.flex-1O1GKY.horizontal-1ae9ci.horizontal-2EEEnY.flex-1O1GKY.directionRow-3v3tfG.justifyStart-2NDFzi.alignStretch-DpGPf3.noWrap-3jynv6"); //Where the mic, deafen and settings buttons are.
            if (!holster) return;
            var menuButton = this.InjectHTML(`<button aria-label="Menu" role="switch" type="button" class="button-14-BFJ enabled-2cQ-u7 button-38aScr lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN" id="MenuButton"><img src="https://i.imgur.com/E58UBzg.png" style="width: 25px; height: 25px;"></button>`);
            holster.appendChild(menuButton);
            document.getElementById('MenuButton').addEventListener("click", (() => { CordAPI.UI.OpenMenu(); }));
        }
    }
};

module.exports = CordAPI;