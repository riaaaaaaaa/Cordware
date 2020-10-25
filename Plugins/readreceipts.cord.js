var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Read Receipts",
    Author: "Yaekith",
    Description: "This plugin should give you a good indication on when users have read your direct messages.",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        /*
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
                        if (channel && channel.type == 1) {
                            var currentUserId = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id;
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId).filter(x => x.author.id == currentUserId);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage != undefined && user != undefined) {
                                if (userId != currentUserId && channel.type == 1 && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`; 
                                }
                            }
                        }
                    break;
                    case "MESSAGE_UPDATE":
                        var channelId = result.methodArguments[0].message.channel_id;
                        var message = result.methodArguments[0].message;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(userId);
                        var author = message.author;
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel != undefined && channel.type == 1) {
                            var currentUserId = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id;
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId).filter(x => x.author.id == currentUserId);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage != undefined && user != undefined) {
                                if (author.id != currentUserId && channel.type == 1 && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`; 
                                }   
                            }
                        }
                    break;
                    case "MESSAGE_CREATE":
                        var channelId = result.methodArguments[0].channelId;
                        var message = result.methodArguments[0].message;
                        var userId = result.methodArguments[0].message.author.id;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(userId);
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        var currentUserId = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id;
                        var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId).filter(x => x.author.id == currentUserId);
                        var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                        if (YourLastMessage != undefined && channel != undefined && user != undefined) {
                            if (userId != currentUserId && channel.type == 1 && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`; 
                            }   
                        }
                    break;
                }
                return result.callOriginalMethod(result.methodArguments);
            });
        } 
        catch(err) {}
        */
    }
})