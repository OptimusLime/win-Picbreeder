var winjs = require('win-save');

var path =require('path');
var express = require('express');

//export two functions -- launch AND delete
var exp = {launch: launcher, clean: cleanDatabase};

module.exports = exp;

var options =  {port: 3000, modifier: 'pic'};
var requiredObjects = {artifactType: "picArtifact", directory: __dirname, seedDirectory: './seeds', schemaDirectory: './schemas'};

function launcher()
{
	winjs.launchWIN(requiredObjects, options,
	    function(err, app)
	{
	    if(err)
	        throw new Error('Messed up starting WIN- make sure mongo is running.');

	    //now we're launched
	    console.log('Winsave waiting on port 3000!');

	});
}

function cleanDatabase(cb)
{
	console.log(winjs);
	winjs.clearWINDatabases(options.modifier, requiredObjects, cb);
}

//for being called by mongodb
// launcher();

