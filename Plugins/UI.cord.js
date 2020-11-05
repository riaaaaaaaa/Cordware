var Plugin = require('./plugin');
var CordAPI = require('../API/API');

module.exports = new Plugin({
    Name: "User Interface Enhancements",
    Author: "Yaekith",
    Description: "Enhances your general discord client user interface and makes things look a lot cleaner/better in my opinion.",
    Version: 1.0,
    OriginURL: "",
    OnInjection: function() {
        var scrollableContainer = CordAPI.Modding.FilterWebpackModule("scrollableContainer").scrollableContainer;
        
        setInterval(() => 
        {
            if (document.getElementsByClassName(scrollableContainer).length > 0)
            {
                if (scrollableContainer) 
                {
                    var elements = document.getElementsByClassName(scrollableContainer);
                    for(var elem in elements) 
                    {
                        if (elements[elem]) {
                            elements[elem].className = elements[elem].className.replace(scrollableContainer, "");
                        }
                    } 
                }
            } 
        }, 1);
    }
})