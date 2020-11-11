var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "No Track",
    Author: "Prevent discord from tracking you with /science",
    Description: "Yaekith",
    OriginURL: "",
    OnInjection: function() 
    {
        var post = CordAPI.Modding.FilterWebpackModule("post");
        CordAPI.Modding.PatchMethod(post, 'post', (result) => 
        {
            if (result.methodArguments[0].url.includes("science")) {
                result.methodArguments[0].body = "";
            }
            
            return result.callOriginalMethod(result.methodArguments);
        });
    }
})