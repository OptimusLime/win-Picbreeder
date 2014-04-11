var express = require('express');

var path = require('path');
module.exports = pbServer;

function pbServer()
{
	var app = express();

	console.log("Build located: ", path.resolve(__dirname, "../build"));

	app.use("/build", express.static(path.resolve(__dirname, "../build")));
	app.use("/js", express.static(path.resolve(__dirname, "../libs")));

	app.get("/", function(req,res)
	{
		//send home for when you enter nothing!
		res.sendfile(__dirname + "/pbHome.html");
	});

	//otherwise, just serve what's in this folder as is
	app.use(express.static(__dirname));

	return app;
}




