var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Example Plugin",
    Author: "Example Bob",
    Description: "An example plugin.",
    OriginURL: "",
    OnInjection: function() {
        //the function that gets called as soon as the plugin gets loaded, aka on Injection.

        console.log('Hello from example plugin!');
    },
    OnEjection: function()
    {
        //the function that gets called when the client ejects or plugin disposes/unloads.

        console.log('Farewell Cordware! This is goodbye from example plugin :(');

        var audio = new Audio("https://cdn.discordapp.com/attachments/769417606523650088/769713693071376444/titanic.mp3");
        audio.volume = 1.0;
        audio.play();

        //Rest in peace, example plugin, we'll miss you
    }
})