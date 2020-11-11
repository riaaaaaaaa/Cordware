var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Spotify Utils",
    Author: "Yaekith",
    Description: "Some spotify utilities to justify your discord experience",
    OriginURL: "",
    OnInjection: function() {
        CordAPI.Modding.NullPatchMethod(CordAPI.Modding.FilterWebpackModule("SpotifyAPI"), 'pause');
    }
})