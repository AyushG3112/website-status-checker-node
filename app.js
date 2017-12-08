
const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const webStatusChecker = require('./lib/webChecker')


if (cluster.isMaster) {
    for(var i = 0; i < require('os').cpus().length; i++) {
        cluster.fork()
    }
} else {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/', function (req, res) {
        return webStatusChecker.check(req.query.urlToCheck, 3).then(function (status) {
            res.status(200).json({
                message: "Ok",
                status: status
            })
        }).catch(function (err) {
            res.status(500).json({
                message: "Something Went Wrong"
            })
        })

    });

    app.listen(8000)


}

