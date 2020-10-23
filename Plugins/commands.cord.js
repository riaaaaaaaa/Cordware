var Plugin = require('./plugin');
var CordAPI = require('../API/API');
var request = require('request');

module.exports = new Plugin({
    Name: "Commands Mod",
    Author: "Yaekith",
    Description: "This plugin gives you commands built into your discord client :^)",
    Version: 1.0,
    OriginURL: "",
    OnInjection: new function() {
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
                        request.get('http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true', {}, (err, res, body) => {
                            request.post(`https://discord.com/api/v8/channels/${channelId}/messages`,
                            {
                                headers: {
                                    'Authorization' : CordAPI.Modding.FilterWebpackModule("getToken").getToken(),
                                    'Content-Type' : 'application/json' 
                                },
                                body: `{"content":"${JSON.parse(body)[0]}","nonce":null,"tts":false}`
                            }, (err, res, body) => {})
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