const http  = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const server = app.listen(config.appPort, function(){
     console.log((new Date()) + 'App Server is listening on port ' + config.appPort);
});

app.use(session({
    secret:'35QZ9QxAuRcyFA',
    resave:false,
    saveUninitialized:true
}));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.text());

exports.app = app;
exports.server = server;