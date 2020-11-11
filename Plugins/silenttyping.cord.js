var Plugin = require('./plugin');
var CordAPI = require('../API/API');
var Patched = false;

module.exports = new Plugin({
    Name: "Silent Typing",
    Author: "Yaekith",
    Description: "Prevents your client from sending the typing request to indicate you're engaging in a conversation :^)",
    OriginURL: "",
    OnInjection: function() 
    {
        try {
            CordAPI.Modding.NullPatchMethod(CordAPI.Modding.FilterWebpackModule("startTyping"), 'startTyping');
        }
        catch { }
    }
})