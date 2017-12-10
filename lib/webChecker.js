const http = require('http');
const https = require('https');
const TIMEOUT_PERIOD = 3000; // 3 seconds;

const ONLINE_ITENTIFIER = "Online";
const OFFLINE_ITENTIFIER = "Offline";
const WebsiteStatusChecker = function () { }

WebsiteStatusChecker.prototype.isOnline = function (url, isHttps) {
    let self = this;
    let prefix = 'http://';
    let module = http;
    if(isHttps === true) {
        prefix = 'https://';    
        module = https;
    }
    
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(OFFLINE_ITENTIFIER)
        }, TIMEOUT_PERIOD);
        module.get(`${prefix}${url}`, function (res) {
            let statusCode = res.statusCode;
            if(statusCode < 300) {
                resolve(ONLINE_ITENTIFIER)
            } else if(statusCode >= 300 && statusCode < 400) {
                let redirectedUrl = res.headers.location;
                let httpsMode = res.headers.location.startsWith('https://')
                if(httpsMode) {
                    redirectedUrl = redirectedUrl.replace('https://','')           
                } else {
                    redirectedUrl = redirectedUrl.replace('http://','')                               
                }            
                return self.isOnline(encodeURI(redirectedUrl), httpsMode).then(resolve);
            } else {
                resolve(OFFLINE_ITENTIFIER);
            }            
            res.on('error', function (err) {
                resolve(OFFLINE_ITENTIFIER)
                res.destroy();
            })
        }).on('error', function (error) {
            console.log(error)
            resolve(OFFLINE_ITENTIFIER)
        })
    })
}

WebsiteStatusChecker.prototype.check = function (url, isHttps, maxRetries) {
    var self = this;
    return this.isOnline(url, isHttps).then(function (result) {
        if (result === ONLINE_ITENTIFIER) {
            return ONLINE_ITENTIFIER;
        } else if (maxRetries > 0) {
            return self.check(url, isHttps, maxRetries - 1)
        } else {
            return OFFLINE_ITENTIFIER
        }
    })
}



module.exports = new WebsiteStatusChecker();
