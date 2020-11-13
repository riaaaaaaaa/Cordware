var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "DM Notify",
    Author: "Yaekith",
    Description: "This plugin notifies you when someone is about to dm you.",
    OriginURL: "",
    Logo: "https://i.imgur.com/4PkPhhY.jpg",
    OnInjection: function() 
    {
        try 
        {
            var dispatch = CordAPI.Modding.FilterWebpackModule("dispatch");
            CordAPI.Modding.PatchMethod(dispatch, "dispatch", (result) => 
            {
                switch(result.methodArguments[0].type)
                {
                    case "TYPING_START":
                        var channelId = result.methodArguments[0].channelId;
                        var userId = result.methodArguments[0].userId;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(userId);
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && channel.type) 
                        {
                            switch(channel.type)
                            {
                                case 1:
                                new Notification("Cordware - DM Notifier", {
                                    body: `${user.username}#${user.discriminator} is about to directly message you`
                                });
                                break;
                                case 3:
                                new Notification("Cordware - DM Notifier", {
                                    body: `${user.username}#${user.discriminator} is about to message in group chat: ${channel.name}`
                                });
                                break;
                            }
                        }
                    break;
                }
                
                return result.callOriginalMethod(result.methodArguments);
            });
        }
        catch(err) { }
    }
})