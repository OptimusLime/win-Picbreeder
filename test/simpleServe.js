var express = require('express');

var app = express();

app.use("/build", express.static( __dirname + "/../build"));
app.use(express.static(__dirname));


app.listen(8000, function()
{
	console.log('Listening on port 8000');

});


