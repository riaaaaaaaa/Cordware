var Plugin = require('./plugin');
var CordAPI = require('../API/API');
var fs = require('fs');
var CustomSounds = [];

module.exports = new Plugin({
    Name: "Custom Sounds",
    Author: "Yaekith",
    Description: "This plugin should replace discord official sounds with custom ones.",
    OriginURL: "",
    Logo: "https://i.imgur.com/4PkPhhY.jpg",
    OnInjection: function() 
    {
        try 
        {
            if (!fs.existsSync(`${process.env.ClientDirectory}\\sounds.json`)) 
            {
                fs.writeFileSync(`${process.env.ClientDirectory}\\sounds.json`, JSON.stringify
                ({
                    "message1" : "https://cdn.discordapp.com/attachments/769482709260042270/769774061009633311/BrowserHistoryLoggerEnabled.mp3",
                    "user_join" : "https://cdn.discordapp.com/attachments/769497804908265512/769779638342778890/hi_fbi.mp3",
                    "disconnect" : "https://cdn.discordapp.com/attachments/769512449396572191/769779514883833867/russian_haha.mp3"
                }));
            }

            CustomSounds = JSON.parse(fs.readFileSync(`${process.env.ClientDirectory}\\sounds.json`, "utf8"));
            var playSound = CordAPI.Modding.FilterWebpackModule("playSound");
            CordAPI.Modding.PatchMethod(playSound, "playSound", (result) => 
            {
                console.log(result.methodArguments[0]);
                switch(result.methodArguments[0])
                {
                    case "message1":
                        var audio = new Audio(CustomSounds["message1"]);
                        audio.volume = 1.0;
                        audio.play();
                    return;
                    case "user_join":
                        var audio = new Audio(CustomSounds["user_join"]);
                        audio.volume = 1.0;
                        audio.play();
                    return;
                    case "disconnect":
                        var audio = new Audio(CustomSounds["disconnect"]);
                        audio.volume = 1.0;
                        audio.play();
                    return;
                }

                return result.callOriginalMethod(result.methodArguments);
            });
        }
        catch(err) { }
    }
})