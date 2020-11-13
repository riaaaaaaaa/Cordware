var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Last Read",
    Author: "Yaekith",
    Description: "This plugin gives you the closest thing you can get to read receipts on discord",
    OriginURL: "",
    Logo: "https://i.imgur.com/4PkPhhY.jpg",
    OnInjection: function() {
        try 
        {
            var dispatch = CordAPI.Modding.FilterWebpackModule("dispatch");
            CordAPI.Modding.PatchMethod(dispatch, "dispatch", (result) => 
            {
                switch(result.methodArguments[0].type)
                {
                    case "MESSAGE_CREATE":
                        var channelId = result.methodArguments[0].channelId;
                        var author = result.methodArguments[0].message.author;
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && author && channel.type == 1) {
                            var currentUser = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser();
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId)._array.filter(x => x.author.id == currentUser.id);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage) {
                                if (author.id != currentUser.id && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${author.username}**)`;
                                    CordAPI.Logging.Log(`${author.username} has seen your last message.`);
                                }
                            }
                        }
                    break;
                    case "MESSAGE_UPDATE":
                        var channelId = result.methodArguments[0].message.channel_id;
                        var author = result.methodArguments[0].message.author;
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && author && channel.type == 1) {
                            var currentUser = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser();
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId)._array.filter(x => x.author.id == currentUser.id);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage) {
                                if (author.id != currentUser.id && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${author.username}**)`;
                                    CordAPI.Logging.Log(`${author.username} has seen your last message.`);
                                }
                            }
                        }
                    break;
                    case "TYPING_START":
                        var channelId = result.methodArguments[0].channelId;
                        var user = CordAPI.Modding.FilterWebpackModule("getUser").getUser(result.methodArguments[0].userId);
                        var channel = CordAPI.Modding.FilterWebpackModule("getChannel").getChannel(channelId);
                        if (channel && user && channel.type == 1) {
                            var currentUser = CordAPI.Modding.FilterWebpackModule("getCurrentUser").getCurrentUser();
                            var AllYourMessages = CordAPI.Modding.FilterWebpackModule("getMessages").getMessages(channelId)._array.filter(x => x.author.id == currentUser.id);
                            var YourLastMessage = AllYourMessages[AllYourMessages.length - 1];
                            if (YourLastMessage) {
                                if (user.id != currentUser.id && !YourLastMessage.content.toLowerCase().includes("last read @")) {
                                    YourLastMessage.content = YourLastMessage.content + ` (**Last Read @ ${new Date().toLocaleString()} by ${user.username}**)`;
                                    CordAPI.Logging.Log(`${user.username} has seen your last message.`);
                                }
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