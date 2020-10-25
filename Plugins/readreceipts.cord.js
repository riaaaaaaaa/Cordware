var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Read Receipts",
    Author: "Yaekith",
    Description: "This plugin should give you a good notification on when users have read your direct messages.",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        try 
        {
            CordAPI.Modding.PatchMethod(dispatch, 'dispatch', (dispatchResult) => 
            {
                switch(dispatchResult.methodArguments[0].type)
                {
                    case "MESSAGE_CREATE":
                        var channelId = dispatchResult.methodArguments[0].channelId;
                        var userId = dispatchResult.methodArguments[0].message.author.id;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(userId);
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && channel.type == 1) {
                            var currentUserId = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id;
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId).filter(x => x.author.id == currentUserId);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage && user) {
                                if (userId != currentUserId && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`; 
                                    new Notification("Cordware - Read Receipts", {
                                        body: `${user.username} has just read your last message`
                                    });
                                }
                            }
                        }
                    break;
                    case "MESSAGE_UPDATE":
                        var channelId = dispatchResult.methodArguments[0].message.channel_id;
                        var userId = dispatchResult.methodArguments[0].message.author.id;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(userId);
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && channel.type == 1) {
                            var currentUserId = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id;
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId).filter(x => x.author.id == currentUserId);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage && user) {
                                if (userId != currentUserId && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`; 
                                    new Notification("Cordware - Read Receipts", {
                                        body: `${user.username} has just read your last message`
                                    });
                                }
                            }
                        }
                    break;
                    case "TYPING_START":
                        var channelId = dispatchResult.methodArguments[0].channelId;
                        var userId = dispatchResult.methodArguments[0].userId;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(userId);
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && channel.type == 1) {
                            var currentUserId = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser().id;
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId).filter(x => x.author.id == currentUserId);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage && user) {
                                if (userId != currentUserId && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`; 
                                    new Notification("Cordware - Read Receipts", {
                                        body: `${user.username} has just read your last message`
                                    });
                                }
                            }
                        }
                    break;
                }

                return dispatchResult.callOriginalMethod(dispatchResult.methodArguments);
            });
        } 
        catch(err) {}
    }
})