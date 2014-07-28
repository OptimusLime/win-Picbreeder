
//let's serve our website as the win server might
var fs = require('fs');
var pbServer = require(__dirname + "/../winServe.js");
var pbConfig = fs.readFileSync(__dirname + "/../pbConfig.json");

if(!pbConfig)
    throw new Error("Incorrect build process: pbConfig.json not generated");

pbConfig = JSON.parse(pbConfig);

//console.log(pbConfig);

//create express server
var express =require('express');
var app = express();


//launch pbapp
var pbApp;

var apiRoot = pbConfig.apiRoot;

pbServer(function(err, pbInnerApp)
{
    //
    pbApp = pbInnerApp;

    //
    app.use(pbApp);

    var port = pbConfig.winHostPort;
    app.listen(port, function()
    {
            console.log('Listening on port: ' + port);

    });
});

app.get(apiRoot + "*", function(req,res, next)
{
        //strip the app part of the req url 
         
	if(apiRoot != "")
         req.url = req.url.replace(apiRoot, "/");

        console.log("New URL: ", req.url);

        pbApp(req,res,next);
});

app.post(apiRoot + "*", function(req,res, next)
{
        //strip the app part of the req url 
        if(apiRoot != "")
         req.url = req.url.replace(apiRoot, "/");

        console.log("New POST URL: ", req.url);

        pbApp(req,res,next);
});

