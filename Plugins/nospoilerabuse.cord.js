var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "No Spoiler Abuse",
    Author: "Yaekith",
    Description: "Get rid of those annoying kids who abuse spoilers to hide invites in messages or 'mask' certain messages.",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        try 
        {
            var getMessages = CordAPI.Modding.FilterWebpackModule("getMessages");
            var dispatch = CordAPI.Modding.FilterWebpackModule("dispatch");
            CordAPI.Modding.PatchMethod(getMessages, 'getMessages', (getMessagesResult) => 
            {
                var original = getMessagesResult.callOriginalMethod(getMessagesResult.methodArguments);

                for(var i = 0; i < original._array; i++) {
                    var message = original._array[i];
                    var occurrences = message.content.match(/|/g);

                    if (occurrences.length > 100) {
                        message.content = message.content.replace('|', '');
                    }
                }

                return original;
            });

            CordAPI.Modding.PatchMethod(dispatch, 'dispatch', (dispatchResult) => 
            {
                var original = dispatchResult.callOriginalMethod(dispatchResult.methodArguments);

                switch(dispatchResult.methodArguments[0].type)
                {
                    case "MESSAGE_CREATE":
                        var message = dispatchResult.methodArguments[0].message;

                        if (message) {
                            var occurrences = message.content.match(/|/g);

                            if (occurrences.length > 100) {
                                message.content = message.content.replace('|', '');
                            }
                        }
                    break;
                    case "MESSAGE_UPDATE":
                        var message = dispatchResult.methodArguments[0].message;
                        
                        if (message) {
                            var occurrences = message.content.match(/|/g);

                            if (occurrences.length > 100) {
                                message.content = message.content.replace('|', '');
                            }
                        }
                    break;
                }

                return original;
            });
        }
        catch(err) {}
    }
})