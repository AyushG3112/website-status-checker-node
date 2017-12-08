const http = require('https');

const WebsiteStatusChecker  =  function() {}
    WebsiteStatusChecker.prototype.isOnline = function(url) {
        return new Promise(function (resolve, reject) {
            http.get("https://"+url, function(res) {
                res.on('data', function(data) {
                    resolve("Online")
                    res.destroy()
                })
                res.on('error', function(err) {
                    resolve("Offline")
                    res.destroy();
                })
            }).on('error', function(error) {
                resolve("Offline")
            })
        })
    }

WebsiteStatusChecker.prototype.check = function(url, maxRetries) {
    var self = this;
    return this.isOnline(url).then(function (result) {
        if(result  === "Online") {
            return "Online";
        } else if (maxRetries > 0) {
            return self.check(url, maxRetries - 1)
        } else {
            return "Offline"
        }
    })
    // return new Promise(function (resolve, reject) {
    //     http.get("http://"+url, function(res) {
    //         resolve("Online")
    //
    //         res.destroy();
    //
    //     }).on('error', function(err) {
    //         resolve("Offline")
    //
    //     })
    // })
}



module.exports = new WebsiteStatusChecker();