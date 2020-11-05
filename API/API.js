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
                CordAPI.Logging.Log(`Loaded ${plugin.Name} by ${plugin.Author} v${plugin.Version}`);
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
                for(var i = 0; i < this.InjectedPlugins.length; i++)
                {
                    var plugin = this.InjectedPlugins[i];
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
            switch (type) {
                case "Basement":
                    elementHolster = document.getElementById('InsertBasementButtonsHere');
                    this.AddMenuButton(elementHolster, "Join Blast", "Invite your friends and throw a tea party.", "https://i.imgur.com/lo7IiCL.png", () => { });
                    this.AddMenuButton(elementHolster, "Leave Blast", "Come on guys, party's over, let's leave.", "https://i.imgur.com/KjcSy6v.png", () => { });
                    this.AddMenuButton(elementHolster, "User Attack", "Commit immense crimes of harassment and cyber-bully some users.", "https://i.imgur.com/ToNtVxr.png", () => { });
                    this.AddMenuButton(elementHolster, "Server Attack", "Commit war crimes on the western front of Discord.", "https://i.imgur.com/C05Q1yF.png", () => { });
                    this.AddMenuButton(elementHolster, "Friend Attack", "Let's give people the chance to not be lonely for once.", "https://i.imgur.com/0eAdzU3.png", () => { });
                break;
                case "Attic":
                    elementHolster = document.getElementById('InsertAtticButtonsHere');
                    this.AddMenuButton(elementHolster, "Shibe", "Sends a cute picture of a shibe", "https://cdn.shibe.online/shibes/ac1360d2aabccd660fd87540016bd187b6d5ffca.jpg", () => window.CommandsAPI.Shibe());
                    this.AddMenuButton(elementHolster, "Neko", "Sends a lewd picture of a neko", "https://cdn.nekos.life/lewd/lewd_neko_419.jpg", () => window.CommandsAPI.Neko());
                    this.AddMenuButton(elementHolster, "Eval", "Eval any code you wish here!", "https://i.imgur.com/tyQJsqo.png", () => window.MenuAPI.EvalCode());
                    this.AddMenuToggleButton(elementHolster, "Cordware Indicator", "Channel up all the energy possible to decide whether you want people to indicate that you're using Cordware or not.", "https://i.imgur.com/dE9I36L.jpg", (window.CordwareSettings.CordwareIndicator ? "Enabled" : "Disabled"), () => { window.CordwareSettings.CordwareIndicator = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.CordwareIndicator = false; window.CordwareConfiguration.SaveSettings(); });
                break;
                case "Quantum":
                    elementHolster = document.getElementById('InsertQuantumButtonsHere');
                    this.AddMenuButton(elementHolster, "Mention Everyone", "Bypass the restriction on @everyone in any guild.", "https://webstockreview.net/images/clipart-phone-email-address-4.png", () => window.Secrets.TryMentionEveryone());
                    this.AddMenuButton(elementHolster, "Block Bypass", "Talk to people you've blocked, without them being able to reply, isn't discord nice?", "https://i.ibb.co/C657F45/attack.png", () => window.MenuAPI.BlockBypass());
                    this.AddMenuButton(elementHolster, "Outage", "Target the current selected server and become God.", "https://i.imgur.com/mfO0ViH.png", () => window.MenuAPI.Outage());
                    this.AddMenuButton(elementHolster, "???", "Break Reality, become God and rule over anyone you wish.", "https://media1.tenor.com/images/019ebaf445dbd03904199c18262df707/tenor.gif", () => window.DisconnectMode());
                    this.AddMenuToggleButton(elementHolster, "Silent Typing", "Enable/Disable Silent Typing. (Other users can't see you type while this is enabled)", "https://i.imgur.com/vaTpgUa.png", (window.CordwareSettings.SilentTyping ? "Enabled" : "Disabled"), () => { window.CordwareSettings.SilentTyping = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.SilentTyping = false; window.CordwareConfiguration.SaveSettings(); });
                
                    if (window._CordwareStorage.PreviousToken == "") {
                        this.AddMenuButton(elementHolster, "Possess", "Bring up all the energy you have, and possess a user's account.", "https://i.imgur.com/i1U8K0y.png", () => window.MenuAPI.Possess());
                    } else {
                        this.AddMenuButton(elementHolster, "Restore", "Restore yourself, become a human again after possessing someone.", "https://i.imgur.com/i1U8K0y.png", () => window.MenuAPI.Possess());
                    }

                    this.AddMenuToggleButton(elementHolster, "Encryption", "Enable/Disable Encryption for all messages sent, other Cordware client users will automatically decrypt this data if encryption is enabled on their side too.", "https://i.imgur.com/9gDwjFd.png", (window.CordwareSettings.EncryptMessages ? "Enabled" : "Disabled"), () => { window.CordwareSettings.EncryptMessages = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.EncryptMessages = false; window.CordwareConfiguration.SaveSettings() })
                    this.AddMenuToggleButton(elementHolster, "Socket Spoofer", "Enable/Disable the gateway socket spoofer, this will automatically spoof data sent to the gateway and manipulate it to your liking instead of usually transmitted information.", "https://i.imgur.com/ELpQfoQ.gif", (window.CordwareSettings.SocketSpoofer ? "Enabled" : "Disabled"), () => { window.CordwareSettings.SocketSpoofer = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.SocketSpoofer = false; window.CordwareConfiguration.SaveSettings(); })
                    this.AddMenuToggleButton(elementHolster, "Stream Spoofer", "This feature will constantly spoof your stream as paused when it's not.", "https://i.imgur.com/pYFAL1m.gif", (window.CordwareSettings.StreamSpoofer ? "Enabled" : "Disabled"), () => { window.CordwareSettings.StreamSpoofer = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.StreamSpoofer = false; window.CordwareConfiguration.SaveSettings(); })
                    this.AddMenuToggleButton(elementHolster, "Anti Phone Lock", "Prevent discord's security systems from phone locking your account, using a new exploit.", "https://i.imgur.com/eB9sOJf.png", (window.CordwareSettings.AntiLockExploit ? "Enabled" : "Disabled"), () => { window.CordwareSettings.AntiLockExploit = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.AntiLockExploit = false; window.CordwareConfiguration.SaveSettings(); });
                    this.AddMenuToggleButton(elementHolster, "Anti Outage", "Prevent the discord server outage exploit from affecting you, in any server.", "https://i.imgur.com/id1HTxu.png", (window.CordwareSettings.AntiOutageExploit ? "Enabled" : "Disabled"), () => { window.CordwareSettings.AntiOutageExploit = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.AntiOutageExploit = false; window.CordwareConfiguration.SaveSettings(); });
                    this.AddMenuToggleButton(elementHolster, "Anti Disconnect", "Prevent other users from disconnecting you from any voice channel. (You can not run this on private channels you've been moved into.)", "https://i.pinimg.com/originals/1a/bb/e9/1abbe9b61eac9e87c845c4f2e1ea1356.gif", (window.CordwareSettings.AntiDisconnect ? "Enabled" : "Disabled"), () => { window.CordwareSettings.AntiDisconnect = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.AntiDisconnect = false; window.CordwareConfiguration.SaveSettings(); });
                    this.AddMenuToggleButton(elementHolster, "Anti Exploit", "Prevent all known exploits from affecting you.", "https://i.imgur.com/2gdM7qH.png", (window.CordwareSettings.AntiExploit ? "Enabled" : "Disabled"), () => { window.CordwareSettings.AntiExploit = true; window.CordwareConfiguration.SaveSettings(); }, () => { window.CordwareSettings.AntiExploit = false; window.CordwareConfiguration.SaveSettings(); });
                break;
                case "Menu":
                    elementHolster = document.getElementById('InsertMenuButtonsHere');

                    this.AddMenuButton(elementHolster, "Quantum", "Discover the secrets of this vast world, uncover the impossible and learn to overcome all challenges.", "https://i.imgur.com/4b4h7Kq.png", () => {
                        this.FadeOut(document.getElementById("MainCordwareWindow"));
                        var CurrentUsertag = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().username + "#" + CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().discriminator;
                        this.CreateMenu("QuantumWindow", "Quantum", `Achieving the impossible and heading forward towards victory. <br>Welcome scientist, ${CurrentUsertag}`, "InsertQuantumButtonsHere", "https://i.imgur.com/FLdcbL8.gif", () => this.AddMenuButtons("Quantum"));
                    });

                    this.AddMenuButton(elementHolster, "Basement", "Head your way down to the basement, where the deepest darkest secrets of Cordware are kept (We still have raiding abilities)", "https://www.dreamdictionary.org/wp-content/uploads/2020/01/83a8fc4e-4acd-4212-8d00-1d9560afb41a.jpg", () => {
                        this.FadeOut(document.getElementById("MainCordwareWindow"));
                        var CurrentUsertag = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().username + "#" + CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().discriminator;
                        this.CreateMenu("BasementWindow", "The Basement", `What's down here?<br>Welcome scientist, ${CurrentUsertag}`, "InsertBasementButtonsHere", "https://i.imgur.com/NcdmKmU.gif", () => this.AddMenuButtons("Basement"));
                    });

                    this.AddMenuButton(elementHolster, "Attic", "Open the attic and head into the room of memories that have been kept away.", "https://hanatimber.com.au/wp-content/uploads/2019/06/Timber-Floor-Sydney-32-720x380.jpg", () => {
                        this.FadeOut(document.getElementById("MainCordwareWindow"));
                        var CurrentUsertag = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().username + "#" + CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().discriminator;
                        this.CreateMenu("AtticWindow", "The Attic", `What's up here?<br>Welcome scientist, ${CurrentUsertag}`, "InsertAtticButtonsHere", "https://i.imgur.com/8mOG9DM.gif", () => this.AddMenuButtons("Attic"));
                    });

                    this.AddMenuButton(elementHolster, "Terminal", "Start a new terminal session and enter some commands.", "https://cdn.discordapp.com/attachments/728975000756813845/730357693067296828/bill_cipher.gif", () => {
                        this.FadeOut(document.getElementById("MainCordwareWindow"));
                        window.MenuAPI.OpenTerminalWindow();
                    });
                break;
            }
        },
        AddMenuButton(Holster, ButtonTitle, ButtonDescription, ButtonIconURL, callback) 
        {
            if (document.getElementById(ButtonTitle)) return;
            var element = this.InjectHTML(`<div style="width: 92%" class="card-o7rAq- clickable-ya6Upc cardPrimaryEditable-3KtE4g card-3Qj_Yx"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><img alt="" src="${ButtonIconURL}" class="iconWrapper-lS1uig flexChild-faoVW3" style="flex: 0 0 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp alignStretch-DpGPf3 noWrap-3jynv6 wrapper-1sov8s" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><h3 class="secondaryHeader-2oeRPO base-1x0h_U size16-1P40sf">${ButtonTitle}</h3><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs wrap-ZIn9Iy" style="flex: 1 1 auto;"><div class="detailsWrapper-3XSaoN"><div class="colorHeaderSecondary-3Sp3Ft size12-3cLvbJ">${ButtonDescription}</div></div></div></div></div><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyEnd-2E6vba alignCenter-1dQNNs noWrap-3jynv6 flexChild-faoVW3" style="flex: 0 0 auto;" id="${ButtonTitle}"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6" style="flex: 1 1 auto;"><div class="colorStandard-2KCXvj size14-e6ZScH">Execute</div><svg class="caret-Ld-w32" aria-hidden="false" width="10" height="10" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><polygon fill="currentColor" fill-rule="nonzero" points="8.47 2 6.12 4.35 13.753 12 6.12 19.65 8.47 22 18.47 12"></polygon><polygon points="0 0 24 0 24 24 0 24"></polygon></g></svg></div></div></div></div>`);
            Holster.appendChild(element);
            var Button = document.getElementById(ButtonTitle);
            Button.addEventListener("click", () => callback());
        },
        AddMenuToggleButton(Holster, ButtonTitle, ButtonDescription, ButtonIconURL, Default = "Enabled", ToggleAction, UntoggleAction) 
        {
            if (document.getElementById(ButtonTitle)) return;
            var element = this.InjectHTML(`<div style="width: 92%" class="card-o7rAq- clickable-ya6Upc cardPrimaryEditable-3KtE4g card-3Qj_Yx"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><img alt="" src="${ButtonIconURL}" class="iconWrapper-lS1uig flexChild-faoVW3" style="flex: 0 0 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyCenter-3D2jYp alignStretch-DpGPf3 noWrap-3jynv6 wrapper-1sov8s" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 1 1 auto;"><h3 class="secondaryHeader-2oeRPO base-1x0h_U size16-1P40sf">${ButtonTitle}</h3><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs wrap-ZIn9Iy" style="flex: 1 1 auto;"><div class="detailsWrapper-3XSaoN"><div class="colorHeaderSecondary-3Sp3Ft size12-3cLvbJ">${ButtonDescription}</div></div></div></div></div><div class="flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV valueChecked-m-4IJZ value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX" id="${ButtonTitle}" tabindex="0" style="flex: 0 0 auto;"><input class="checkboxEnabled-CtinEn checkbox-2tyjJg" type="checkbox" tabindex="-1"></div></div></div>`);
            Holster.appendChild(element);
            var ToggleButton = document.getElementById(ButtonTitle);
            if (Default == "Enabled") ToggleButton.className = "flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV valueChecked-m-4IJZ value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
            else ToggleButton.className = "flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
            ToggleButton.addEventListener("click", () => {
                if (ToggleButton.className == "flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX") {
                    ToggleButton.className = "flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV valueChecked-m-4IJZ value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
                    ToggleAction();
                }
                else {
                    ToggleButton.className = "flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX";
                    UntoggleAction();
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
    }
};

module.exports = CordAPI;