
//let's serve our website as the win server might

var pbServer = require(__dirname + "/../winServe.js");

//create express server
var express =require('express');
var app = express();


//launch pbapp
var pbApp;

pbServer(function(err, pbInnerApp)
{
    //
    pbApp = pbInnerApp;

    //
    app.use(pbApp);

    var port = 3001;
    app.listen(port, function()
    {
            console.log('Listening on port: ' + port);

    });
});

app.get("/apps/win-Picbreeder*", function(req,res, next)
{
        //strip the app part of the req url 

        req.url = req.url.replace("/apps/win-Picbreeder", "");

        console.log("New URL: ", req.url);

        pbApp(req,res,next);
});

app.post("/apps/win-Picbreeder*", function(req,res, next)
{
        //strip the app part of the req url 

        req.url = req.url.replace("/apps/win-Picbreeder", "");

        console.log("New POST URL: ", req.url);

        pbApp(req,res,next);
});

