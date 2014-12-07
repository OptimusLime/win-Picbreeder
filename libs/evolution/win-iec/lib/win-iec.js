//generating session info
var uuid = require('win-utils').cuid;

module.exports = winiec;

function winiec(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "evolution";

	if(!localConfig.genomeType)
		throw new Error("win-IEC needs a genome type specified."); 

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//we have logger and emitter, set up some of our functions

	function clearEvolution(genomeType)
	{
		//optionally, we can change types if we need to 
		if(genomeType)
			self.genomeType = genomeType;

		self.log("clear evo to type: ", self.genomeType)
		self.selectedParents = {};
		//all the evo objects we ceated -- parents are a subset
		self.evolutionObjects = {};

		//count it up
		self.parentCount = 0;

		//session information -- new nodes and connections yo! that's all we care about after all-- new innovative stuff
		//i rambled just then. For no reason. Still doing it. Sucks that you're reading this. trolololol
		self.sessionObject = {};

		//everything we publish is linked by this session information
		self.evolutionSessionID = uuid();

		//save our seeds!
		self.seeds = {};

		//map children to parents for all objects
		self.childrenToParents = {};

		self.seedParents = {};
	}

	//we setup all our basic 
	clearEvolution(localConfig.genomeType);

	//what events do we need?
	self.requiredEvents = function()
	{
		return [
		//need to be able to create artifacts
			"generator:createArtifacts",
			"schema:replaceParentReferences",
			"schema:getReferencesAndParents",
			"publish:publishArtifacts",
			//in the future we will also need to save objects according to our save tendencies
			//for now, we'll offload that to UI decisions
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"evolution:selectParents" : self.selectParents,
			"evolution:unselectParents" : self.unselectParents,
			"evolution:publishArtifact" : self.publishArtifact,
			//we fetch a list of objects based on IDs, if they don't exist we create them
			"evolution:getOrCreateOffspring" : self.getOrCreateOffspring,
			"evolution:loadSeeds" : self.loadSeeds,
			"evolution:resetEvolution" : clearEvolution

		};
	}

	

	// self.findSeedOrigins = function(eID)
	// {
	// 	//let's look through parents until we find the seed you originated from -- then you are considered a decendant
	// 	var alreadyChecked = {};

	// 	var originObjects = {};
	// 	var startingParents = self.childrenToParents[eID];

	// 	while(startingParents.length)
	// 	{
	// 		var nextCheck = [];
	// 		for(var i=0; i < startingParents.length; i++)
	// 		{
	// 			var parentWID = startingParents[i];

	// 			if(!alreadyChecked[parentWID])
	// 			{
	// 				//mark it as checked
	// 				alreadyChecked[parentWID] = true;

	// 				if(self.seeds[parentWID])
	// 				{
	// 					//this is a seed!
	// 					originObjects[parentWID] = self.seeds[parentWID];
	// 				}

	// 				//otherwise, it's not of interested, but perhaps it's parents are!

	// 				//let's look at the parents parents
	// 				var grandparents = self.childrenToParents[parentWID];

	// 				if(grandparents)
	// 				{
	// 					nextCheck = nextCheck.concat(grandparents);
	// 				}
	// 			}
	// 		}

	// 		//continue the process - don't worry about loops, we're checking!
	// 		startingParents = nextCheck;
	// 	}

	// 	//send back all the seed objects
	// 	return originObjects
	// }

	self.publishArtifact = function(id, meta, finished)
	{
		//don't always have to send meta info -- since we don't know what to do with it anyways
		if(typeof meta == "function")
		{
			finished = meta;
			meta = {};
		}
		//we fetch the object from the id

		var evoObject = self.evolutionObjects[id];

		if(!evoObject)
		{
			finished("Evolutionary artifactID to publish is invalid: " + id);
			return;
		}
		//we also want to store some meta info -- don't do anything about that for now 

		// var seedParents = self.findSeedOrigins(id);

		//
		var seedList = [];

		//here is what needs to happen, the incoming evo object has the "wrong" parents
		//the right parents are the published parents -- the other parents 

		//this will need to be fixed in the future -- we need to know private vs public parents
		//but for now, we simply send in the public parents -- good enough for picbreeder iec applications
		//other types of applications might need more info.

		var widObject = {};
		widObject[evoObject.wid] = evoObject;
		self.backEmit("schema:getReferencesAndParents", self.genomeType, widObject, function(err, refsAndParents){

			//now we know our references
			var refParents = refsAndParents[evoObject.wid];

			//so we simply fetch our appropraite seed parents 
			var evoSeedParents = self.noDuplicatSeedParents(refParents);

			//now we have all the info we need to replace all our parent refs
			self.backEmit("schema:replaceParentReferences", self.genomeType, evoObject, evoSeedParents, function(err, cloned)
			{
				//now we have a cloned version for publishing, where it has public seeds

				 //just publish everything public for now!
		        var session = {sessionID: self.evolutionSessionID, publish: true};

		        //we can also save private info
		        //this is where we would grab all the parents of the individual
		        var privateObjects = [];

				self.backEmit("publish:publishArtifacts", self.genomeType, session, [cloned], [], function(err)
				{
					if(err)
					{
						finished(err);
					}
					else //no error publishing, hooray!
						finished(undefined, cloned);

				})

			})

		});
       
	}

	//no need for a callback here -- nuffin to do but load
	self.loadSeeds = function(idAndSeeds, finished)
	{
		//we have all the seeds and their ids, we just absorb them immediately
		for(var eID in idAndSeeds)
		{
			var seed = idAndSeeds[eID];
			//grab the objects and save them
			self.evolutionObjects[eID] = seed;

			//save our seeds
			self.seeds[seed.wid] = seed;
		}

		self.log("seed objects: ", self.seeds);

		self.backEmit("schema:getReferencesAndParents", self.genomeType, self.seeds, function(err, refsAndParents)
		{
			if(err)
			{
				//pass on the error if it happened
				if(finished)
					finished(err);
				else
					throw err;
				return;
			}
			//there are no parent refs for seeds, just the refs themselves which are important
			for(var wid in self.seeds)
			{
				var refs = Object.keys(refsAndParents[wid]);
				for(var i=0; i < refs.length; i++)
				{
					//who is the parent seed of a particular wid? why itself duh!
					self.seedParents[refs[i]] = [refs[i]];
				}
			}

			// self.log("Seed parents: ", self.seedParents);

			//note, there is no default behavior with seeds -- as usual, you must still tell iec to select parents
			//there is no subsitute for parent selection
			if(finished)
				finished();

		});


	}

	//just grab from evo objects -- throw error if issue
	self.selectParents = function(eIDList, finished)
	{
		if(typeof eIDList == "string")
			eIDList = [eIDList];

		var selectedObjects = {};

		for(var i=0; i < eIDList.length; i++)
		{	
			var eID = eIDList[i];

			//grab from evo
			var evoObject = self.evolutionObjects[eID];

			if(!evoObject){
				//wrong id 
				finished("Invalid parent selection: " + eID);
				return;
			}

			selectedObjects[eID] = evoObject;

			//save as a selected parent
			self.selectedParents[eID] = evoObject;
			self.parentCount++;
		}
	
		//send back the evolutionary object that is linked to this parentID
		finished(undefined, selectedObjects);
	}

	self.unselectParents = function(eIDList, finished)
	{
		if(typeof eIDList == "string")
			eIDList = [eIDList];

		for(var i=0; i < eIDList.length; i++)
		{	
			var eID = eIDList[i];

			//remove this parent from the selected parents -- doesn't delete from all the individuals
			if(self.selectedParents[eID])
				self.parentCount--;

			delete self.selectedParents[eID];
		}

		//callback optional really, here for backwards compat 
		if(finished)
			finished();

	}

	self.noDuplicatSeedParents = function(refsAndParents)
	{
		var allSeedNoDup = {};

		//this is a map from the wid to the associated parent wids
		for(var refWID in refsAndParents)
		{
			var parents = refsAndParents[refWID];

			var mergeParents = [];

			for(var i=0; i < parents.length; i++)
			{
				var seedsForEachParent = self.seedParents[parents[i]];

				//now we just merge all these together
				mergeParents = mergeParents.concat(seedsForEachParent);
			}

			//then we get rid of any duplicates
			var nodups = {};
			for(var i=0; i < mergeParents.length; i++)
				nodups[mergeParents[i]] = true;

			//by induction, each wid generated knows it's seed parents (where each seed reference wid references itself in array form)
			//therefore, you just look at your reference's parents to see who they believe is their seed 
			//and concat those results together -- pretty simple, just remove duplicates
			allSeedNoDup[refWID] = Object.keys(nodups);
		}	

		return allSeedNoDup;	
	}

	self.callGenerator = function(allObjects, toCreate, finished)
	{
		var parents = self.getOffspringParents();

		//we need to go fetch some stuff
		self.backEmit("generator:createArtifacts", self.genomeType, toCreate.length, parents, self.sessionObject, function(err, artifacts)
		{
			if(err)
			{
				//pass on the error if it happened
				finished(err);
				return;
			}

			// self.log("iec generated " + toCreate.length + " individuals: ", artifacts);

			//otherwise, let's do this thang! match artifacts to offspring -- arbitrary don't worry
			var off = artifacts.offspring;

			var widOffspring = {};

			for(var i=0; i < off.length; i++)
			{
				var oObject = off[i];
				var eID = toCreate[i];
				//save our evolution object internally -- no more fetches required
				self.evolutionObjects[eID] = oObject;

				//store objects relateive to their requested ids for return
				allObjects[eID] = (oObject);


				//clone the parent objects for the child!
				widOffspring[oObject.wid] = oObject;

				// var util = require('util')
				// self.log("off returned: ".magenta, util.inspect(oObject, false, 3));
			}

			self.backEmit("schema:getReferencesAndParents", self.genomeType, widOffspring, function(err, refsAndParents)
			{
				if(err)
				{
					finished(err);
					return;
				}

				//check the refs for each object
				for(var wid in widOffspring)
				{
					//here we are with refs and parents
					var rAndP = refsAndParents[wid];

					var widSeedParents = self.noDuplicatSeedParents(rAndP);

					// self.log("\n\nwid seed parents: ".magenta, rAndP);


					//for each key, we set our seed parents appropriately	
					for(var key in widSeedParents)
					{
						self.seedParents[key] = widSeedParents[key];
					}
				}

				// self.log("\n\nSeed parents: ".magenta, self.seedParents);

				//mark the offspring as the list objects
				finished(undefined, allObjects);

			});



		});
	}

	//generator yo face!
	self.getOrCreateOffspring = function(eIDList, finished)
	{
		//don't bother doing anything if you havne't selected parents
		if(self.parentCount ==0){
			finished("Cannot generate offspring without parents");
			return;
		}

		//we need to make a bunch, as many as requested
		var toCreate = [];

		var allObjects = {};

		//first we check to see which ids we already know
		for(var i=0; i < eIDList.length; i++)
		{
			var eID = eIDList[i];
			var evoObject = self.evolutionObjects[eID];
			if(!evoObject)
			{
				toCreate.push(eID);
			}
			else
			{
				//otherwise add to objects that will be sent back
				allObjects[eID] = evoObject;
			}
		}

		//now we have a list of objects that must be created
		if(toCreate.length)
		{
			//this will handle the finished call for us -- after it gets artifacts from the generator
			self.callGenerator(allObjects, toCreate, finished);	
		}
		else
		{
			//all ready to go -- send back our objects
			finished(undefined, allObjects)
		}

	}

	self.getOffspringParents = function()
	{
		var parents = [];

		for(var key in self.selectedParents)
			parents.push(self.selectedParents[key]);

		return parents;
	}

	return self;
}




