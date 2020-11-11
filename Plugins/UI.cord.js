var Plugin = require('./plugin');
var CordAPI = require('../API/API');

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
                var scrollableContainer = CordAPI.Modding.FilterWebpackModule("scrollableContainer").scrollableContainer;

                if (scrollableContainer)
                {
                    if (document.getElementsByClassName(scrollableContainer).length > 0) 
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