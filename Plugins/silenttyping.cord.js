var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Silent Typing",
    Author: "Yaekith",
    Description: "Prevents your client from sending the typing request to indicate you're engaging in a conversation :^)",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        CordAPI.Modding.NullPatchMethod(CordAPI.Modding.FilterWebpackModule("startTyping"), 'startTyping');
    }
})