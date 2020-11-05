var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "No Track",
    Author: "Prevent discord from tracking you with /science",
    Description: "Yaekith",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        var post = CordAPI.Modding.FilterWebpackModule("post");
        CordAPI.Modding.PatchMethod(post, 'post', (result) => 
        {
            result.methodArguments[0].url = b.methodArguments[0].url.replace("science", "");
            
            return result.callOriginalMethod(result.methodArguments);
        });
    }
})