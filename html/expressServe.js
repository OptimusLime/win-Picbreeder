var express = require('express');


module.exports = pbServer;

function pbServer()
{
	var app = express();

	app.use("/build", express.static( __dirname + "/../build"));
	app.use("/js", express.static( __dirname + "/../libs"));

	app.get("/", function(req,res)
	{
		//send home for when you enter nothing!
		res.sendfile(__dirname + "/pbHome.html");
	});

	//otherwise, just serve what's in this folder as is
	app.use(express.static(__dirname));

	return app;
}




