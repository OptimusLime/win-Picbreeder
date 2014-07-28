var winjs = require('win-save');

var path =require('path');
var express = require('express');

module.exports = launcher;

function launcher()
{
	winjs.launchWIN({artifactType: "picArtifact", directory: __dirname, seedDirectory: './seeds', schemaDirectory: './schemas'},
	    {port: 3000, modifier: 'pic'},
	    function(err, app)
	{
	    if(err)
	        throw new Error('Messed up starting WIN- make sure mongo is running.');

	    //now we're launched
	    console.log('Winsave waiting on port 3000!');

	});
}

//for being called by mongodb
launcher();

