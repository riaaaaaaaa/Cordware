var Plugin = require('./plugin');
var CordAPI = require('../API/API');
var HaveToClearPayments = false;

module.exports = new Plugin({
    Name: "Safety Features",
    Author: "Safety Jim",
    Description: "This plugin should secure you more, removing your payment info after making purchases, etc.",
    OriginURL: "",
    OnInjection: function() 
    {
        try 
        {
            var post = CordAPI.Modding.FilterWebpackModule("post");
            CordAPI.Modding.PatchMethod(post, 'post', (result) => 
            {
                var url = result.methodArguments[0].url;
                var body = result.methodArguments[0].body;
                var res = result.callOriginalMethod(result.methodArguments);
    
                if (url.includes("/science")) {
                    body = "";
                } else if (url.includes("/purchase")) {
                    HaveToClearPayments = true;
                } else if (url.includes("/premium/subscriptions")) {
                    HaveToClearPayments = true;
                }
    
                return res;
            });
    
            setInterval(() => 
            {
                if (HaveToClearPayments)
                {
                    var token = CordAPI.Modding.FilterWebpackModule("getToken").getToken();
                    CordAPI.Requests.MakeGetRequest('https://discord.com/api/v8/users/@me/billing/payment-sources', false, token, (response) => 
                    {
                        if (response != "[]") 
                        {
                            var paymentsources = JSON.parse(response);
    
                            for(var i = 0; i < paymentsources.length; i++)
                            {
                                CordAPI.Requests.MakeDeleteRequest(`https://discord.com/api/v8/users/@me/billing/payment-sources/${paymentsources[i].id}`, token, () => {
                                    CordAPI.Logging.Success(`Removed a payment method.`)
                                });
                            }
    
                            HaveToClearPayments = false;
                        }
                    });
                }
            }, 5000);
        }
        catch { }
    }
})