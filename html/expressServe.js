var express = require('express');

var path = require('path');
module.exports = pbServer;


var winsave = require('win-save');

function pbServer(finished)
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

	///
  	winsave.createWinApp('pic', 
  		{artifactType: "picArtifact", 
  		directory: path.resolve(__dirname, "../server"), seedDirectory: './seeds', schemaDirectory: './schemas'},
  		 function(err, apiApp, mongooseConnection)
	    {
	        if(err){
	            finished(err);
	            throw new Error(err);
	        }

	        //use this api thing
	        app.use(apiApp);


			//otherwise, just serve what's in this folder as is
			app.use(express.static(__dirname));

	        finished(undefined, app);
	    });
}




