var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "UI",
    Author: "Yaekith",
    Description: "Just an experimental UI for cordware, based off Lazarus' Old Menu.",
    OriginURL: "",
    Logo: "https://i.imgur.com/4PkPhhY.jpg",
    OnInjection: function() 
    {
        setInterval(() => {
            CordAPI.UI.AddMenuOpenerButton();
        }, 1);
    }
})
