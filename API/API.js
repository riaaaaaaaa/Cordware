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
            for(var i = 0; i < this.InjectedPlugins.length; i++)
            {
                var plugin = this.InjectedPlugins[i];
                if (plugin.OnEventCalled && typeof plugin.OnEventCalled == 'function') {
                    plugin.OnEventCalled(type, parameters);
                }
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
            catch(err) {}
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
    }
};

module.exports = CordAPI;