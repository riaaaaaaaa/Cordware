var Plugin = require('./plugin');

module.exports = new Plugin({
    Name: "Auto play gifs",
    Author: "Yaekith",
    Description: "This plugin will auto play gif profile pictures",
    OriginURL: "",
    Logo: "https://i.imgur.com/4PkPhhY.jpg",
    OnInjection: function() 
    {
        setInterval(() => 
        {
            var images = document.getElementsByTagName("img");
            if (images.length > 0)
            {
                for(var i = 0; i < images.length; i++)
                {
                    var image = images[i];
                    var source = image.src;
                    if (!source.includes(".gif"))
                    {
                        if (source.includes("cdn.discordapp.com/avatars/"))
                        {
                            var userID = source.split('/')[4].split('/')[0];
                            var animatedAvatar = window.ModuleUtil.FindModule('hasAnimatedAvatar').hasAnimatedAvatar(window.ModuleUtil.FindModule('getUser').getUser(userID));
                            if (animatedAvatar) 
                            {
                                if (source.includes(".png")) {
                                    image.src = source.replace('.png', '.gif');
                                } 
                                else if (source.includes('.webp')) {
                                    images.src = source.replace('.webp', '.gif');
                                }
                            }
                        }
                    }
                }
            }
        }, 1);
    }
})