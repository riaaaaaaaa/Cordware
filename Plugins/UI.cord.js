var Plugin = require('./plugin');
var CordAPI = require('../API/API');
var scrollableContainer;

module.exports = new Plugin({
    Name: "User Interface Enhancements",
    Author: "Yaekith",
    Description: "Enhances your general discord client user interface and makes things look a lot cleaner/better in my opinion.",
    OriginURL: "",
    OnInjection: function() 
    {  
        try 
        {
            setInterval(() => 
            {
                if (!scrollableContainer && CordAPI.Modding.FilterWebpackModule("scrollableContainer").scrollableContainer) {
                    scrollableContainer = CordAPI.Modding.FilterWebpackModule("scrollableContainer").scrollableContainer;
                }
            
                if (document.getElementsByClassName(scrollableContainer).length > 0)
                {
                    if (scrollableContainer) 
                    {
                        var elements = document.getElementsByClassName(scrollableContainer);
                        for(var elem in elements) 
                        {
                            if (elements[elem] && elements[elem].className) {
                                elements[elem].className = elements[elem].className.replace(scrollableContainer, "");
                            }
                        } 
                    }
                } 
            }, 1);
        }
        catch { }
    }
})