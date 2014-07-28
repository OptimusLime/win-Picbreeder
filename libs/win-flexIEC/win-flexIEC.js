var flexIEC = require('flexiec');
var winIEC = require('win-iec');

var emitter = require('emitter');

//we need to combine the two! Also, we're a win module -- so shape up!
module.exports = winflex;

function winflex(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "ui";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	self.moreThanOneDisplay = localConfig.moreThanOneDisplay || false;

	//we have logger and emitter, set up some of our functions

	self.htmlEvoObjects = {};

	//what events do we need?
	self.requiredEvents = function()
	{
		return [
			"evolution:loadSeeds",
			"evolution:getOrCreateOffspring",
			"evolution:selectParents",
			"evolution:publishArtifact",
			"evolution:unselectParents"
			//in the future we will also need to save objects according to our save tendencies
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"ui:initializeDisplay" : self.initializeDiv,
			"ui:ready" : self.ready
		};
	}

	var uiCount = 0;
	var single = false;

	var uiObjects = {};

	self.chooseRandomSeed = function(seedMap)
	{
		var seedKeys = Object.keys(seedMap);
		var rIx = Math.floor(Math.random()*seedKeys.length);
		return seedKeys[rIx];
	}

	//initialize 
	self.initializeDiv = function(seeds, div, flexOptions, done)
	{
		if(single && self.moreThanOneDisplay)
			return;

		if(!seeds.length)
		{
			done("Must send at least 1 seed to initialization -- for now");
			return;
		}

		if(seeds.length > 1)
			self.log("Undefined behavior with more than one seed in this UI object. You were warned, sorry :/")
		//not getting stuck with an undefined issue
		flexOptions = flexOptions || {};

		//if you only ever allow one div to take over 
		single = true;

		//seed related -- start generating ids AFTER the seed count -- this is important
		//why? Because effectively there is a mapping between ids created in the ui and ids of objects created in evoltuion
		//they stay in sync all the time, except for seeds, where more ids exist than there are visuals. 
		//for that purpose, seeds occupy [0, startIx), 
		var startIx = seeds.length;
		flexOptions.startIx = Math.max(startIx, flexOptions.startIx || 0);

		//part of the issue here is that flexIEC uses the ids as an indicator of order because they are assumed to be numbers
		//therefor remove oldest uses that info -- but in reality, it just needs to time stamp the creation of evo objects, and this can all be avoided in the future
		var seedMap = {};
		for(var i=0; i < seeds.length; i++)
			seedMap["" + i] = seeds[i];

		//untested if you switch that!
		var nf = new flexIEC(div, flexOptions);

		//add some stuff to our thing for emitting
		var uiEmitter = {};
		emitter(uiEmitter);

		//a parent was selected by flex
		nf.on('parentSelected', function(eID, eDiv, finished)
		{
			//now a parent has been selected -- let's get that parent selection to evolution!
			 self.backEmit("evolution:selectParents", [eID], function(err, parents)
			 {
			 	//index into parent object, grab our single object
			 	var parent = parents[eID];

			 	//now we use this info and pass it along for other ui business we don't care about
			 	//emit for further behavior -- must be satisfied or loading never ends hehehe
			 	uiEmitter.emit('parentSelected', eID, eDiv, parent, finished);
			 });
		});

		//parent is no longer rocking it. Sorry to say. 
		nf.on('parentUnselected', function(eID)
		{
			//now a parent has been selected -- let's get that parent selection to evolution!
			 self.backEmit("evolution:unselectParents", [eID], function(err)
			 {
			 	//now we use this info and pass it along for other ui business we don't care about
			 	//emit for further behavior -- must be satisfied or loading never ends hehehe
			 	uiEmitter.emit('parentUnselected', eID);

		 		self.log("act pars: ",nf.activeParents());
			 	//are we empty? fall back to the chosen seed please!
			 	if(nf.activeParents() == 0)
			 	 	nf.createParent(self.chooseRandomSeed(seedMap));

			 });
		});

		//individual created inside the UI system -- let's make a corresponding object in evolution
		nf.on('createIndividual', function(eID, eDiv, finished)
		{
			//let it be known that we are looking for a sweet payday -- them kids derr
			 self.backEmit("evolution:getOrCreateOffspring", [eID], function(err, allIndividuals)
			 {
			 	// console.error("shitidjfdijfdf");
			 	//we got the juice!
			 	var individual = allIndividuals[eID];

			 	self.log("Create ind. create returned: ", allIndividuals);

			 	//now we use this info and pass it along for other ui business we don't care about
			 	//emit for further behavior -- must be satisfied or loading never ends hehehe
			 	uiEmitter.emit('individualCreated', eID, eDiv, individual, finished);
			 });
		});

		nf.on('publishArtifact', function(eID, meta, finished)
		{
			//let it be known that we are looking for a sweet payday -- them kids derr
			 self.backEmit("evolution:publishArtifact", eID, meta, function(err)
			 {
			 	if(err)
			 	{
			 		uiEmitter.emit('publishError', eID, err);
			 	}
			 	else
			 	{
			 		uiEmitter.emit('publishSuccess', eID);
			 	}

			 	//now we are done publishing
			 	finished();

			 });
		});

		//might be published-- we are looking at the modal window
		nf.on('publishShown', function(eID, eDiv, finished)
		{
			//we simply send back the indentifier, and where to put your display in the html object
		 	uiEmitter.emit('publishShown', eID, eDiv, finished);
		});

		//we hid the object -- maybe animation needs to stop or something, let it be known
		nf.on('publishHidden', function(eID)
		{
			uiEmitter.emit('publishHidden', eID);
		});

		//this is a temporary measure for now
		//send the seeds for loading into iec -- there will be a better way to do this in the future
		self.backEmit("evolution:loadSeeds", seedMap, function(err)
		{
			if(err)
			{
				done(err);
			}
			else
			{
				var uID = uiCount++;
				var uiObj = {uID: uID, ui: nf, emitter: uiEmitter, seeds: seedMap};
				uiObjects[uID] = uiObj;
				//send back the ui object
				done(undefined, uiObj);
			}
		});
	}

	self.ready = function(uID, done)
	{
		var uio = uiObjects[uID];

		var nf = uio.ui;

		//pull a random seed to set as the single parent (that's just our choice)
		//we could pull 2 if they existed, but we don't
		
		var parentSeedID = self.chooseRandomSeed(uio.seeds);

		//auto select parent -- this will cause changes to evolution
		nf.createParent(parentSeedID);

		//start up the display inside of the div passed in
		nf.ready();

	}


	return self;
}
