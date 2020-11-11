var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "Channel Mute Fix",
    Author: "Yaekith",
    Description: "This plugin should fix the fact that you can get mentioned in muted channels .-.",
    OriginURL: "",
    OnInjection: function() 
    {
        var getMentionCount = CordAPI.Modding.FilterWebpackModule("getMentionCount");
        CordAPI.Modding.PatchMethod(getMentionCount, 'getMentionCount', (result) => 
        {
            var isChannelMuted = CordAPI.Modding.FilterWebpackModule("isChannelMuted").isChannelMuted(result.methodArguments[0]);
            var original = result.callOriginalMethod(result.methodArguments);
            
            if (isChannelMuted) {
                original = 0;
            }

            return original;
        });
    }
})