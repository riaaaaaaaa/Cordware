var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Commands Mod",
    Author: "Yaekith",
    Description: "This plugin gives you commands built into your discord client :^)",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        try 
        {
            var sendMessage = CordAPI.Modding.FilterWebpackModule("sendMessage");
            CordAPI.Modding.PatchMethod(sendMessage, "sendMessage", (result) => 
            {
                var message = result.methodArguments[1];
                var words = message.content.split(' ');
                var channelId = window.location.toString().split("/")[window.location.toString().split("/").length - 1];

                switch(words[0])
                {
                    case "/shibe":
                        CordAPI.Requests.MakeGetRequest('https://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true', true, "", (response) => 
                        {
                            var shiba = JSON.parse(response)[0];
                            var messageBody = 
                            {
                                content: shiba,
                                nonce: null,
                                tts: false
                            };

                            CordAPI.Requests.MakePostRequest(`https://discord.com/api/v8/channels/${channelId}/messages`, JSON.stringify(messageBody), CordAPI.Modding.FilterWebpackModule("getToken").getToken(), true, () => {});
                        });
                        message.content = "";
                    break;
                }
                
                return result.callOriginalMethod(result.methodArguments);
            });
        }
        catch(err) {}
    }
})