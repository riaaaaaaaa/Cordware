var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Server Outage Notifier",
    Author: "Yaekith",
    Description: "This plugin notifies you about server outages, with details on which servers.",
    Version: 1.0,
    OriginURL: "",
    OnInjection: new function() {
        try 
        {
            var dispatch = CordAPI.Modding.FilterWebpackModule("dispatch");
            CordAPI.Modding.PatchMethod(dispatch, "dispatch", (result) => 
            {
                switch(result.methodArguments[0].type)
                {
                    case "CONNECTION_OPEN":
                        var packet = result.methodArguments[0];
                        var ourToken = CordAPI.Modding.FilterWebpackModule("getToken").getToken();
                        var outageString = "";

                        if (packet.unavailableGuilds.length > 0)
                        {
                            for(var i = 0; i < packet.unavailableGuilds.length; i++)
                            {
                                var guild = packet.unavailableGuilds[i];
                                CordAPI.Requests.MakeGetRequest(`https://discord.com/api/v8/guilds/${guild}`, false, ourToken, (body) => {
                                    if (body && JSON.parse(body).message != "401: Unauthorized") {
                                        outageString += `${JSON.parse(body).name}, `;
                                    }
                                });
                            }

                            outageString = outageString.splice(outageString.lastIndexOf(','), 1);
                            outageString = outageString.splice(outageString.lastIndexOf(' '), 1);

                            new Notification("Cordware - Outage Notifier", {
                                body: `${outageString} is/are currently experiencing a server outage, they should be up soon, hopefully.`
                            });
                        }
                    break;
                }
                
                return result.callOriginalMethod(result.methodArguments);
            });
        }
        catch(err) {}
    }
})