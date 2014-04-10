
//let's serve our website as the win server might

var pbServer = require("../winServe.js");


var pbApp = pbServer();

pbApp.listen(3001, function()
{
	//started pb server
	console.log("Starting pb server");
});


