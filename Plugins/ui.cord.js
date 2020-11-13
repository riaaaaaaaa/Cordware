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
        setInterval(() => 
        {
            CordAPI.UI.AddMenuOpenerButton();
            var scrollableContainer = CordAPI.Modding.FilterWebpackModule('scrollableContainer');
            if (scrollableContainer)
            {
                if (document.getElementsByClassName(scrollableContainer.scrollableContainer).length > 0)
                {
                    var elements = document.getElementsByClassName(scrollableContainer.scrollableContainer);
                    for(var elem in elements) 
                    {
                        if (elements[elem].className != undefined) {
                            elements[elem].className = elements[elem].className.replace(scrollableContainer.scrollableContainer, "");
                        }
                    } 
                } 
            }
        }, 1);
    }
})