var path = require("path");
var express = require('express');
var history = require('connect-history-api-fallback');
var proxyMiddleware = require('http-proxy-middleware')

var config = require('../config')

var app = express();
var router = express.Router();

app.use(express.static(path.join(__dirname, '../dist')));

function done(req, res) {
    var options = {
        root: path.join(process.cwd(), '/dist'),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = 'index.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });
}

/* GET home page. */
router.get('/', function (req, res, next) {
    //判断权限，如果未登录，转到登录界面，已登录则返回页面文件
    done(req, res)
});

router.get(/(\/[\w_\-\d]+)*/, function (req, res, next) {
    //判断权限，如果未登录，转到登录界面，已登录则返回页面文件
    done(req, res)
});

app.use('/', router);

app.use(history());

console.log("++++++++++++++++++++++++");
console.log("服务器文件地址：")
console.log(path.join(__dirname, '../dist'))
console.log("http://127.0.0.1:3000")

app.listen(3000);
