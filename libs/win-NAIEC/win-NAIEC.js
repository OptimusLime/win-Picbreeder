var emitter = require('emitter');
var Q = require('q');
var uuid = require('win-utils').cuid;
var wMath = require('win-utils').math;


//we need to combine the two! Also, we're a win module -- so shape up!
module.exports = winnaiec;

function winnaiec(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "evolution";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	self.populationSize = localConfig.populationSize || 30;

	//pull the single most novel by default
	self.noveltyPerGeneration = localConfig.noveltyPerGeneration || 1;

	self.selectionPercentage = localConfig.selectionPercentage || .3;
	self.maxParentSize = localConfig.maxParentSize || Number.MAX_VALUE;

	if(!localConfig.behaviorGeneratorQueue || !localConfig.noveltyThread)
		throw new Error("win-NAIEC requires a cppn queue or a novelty thread "
			+ "to accept async activation jobs -- node.js or browser based");

	if(!localConfig.convertToQueueObject)
		throw new Error("Need function \"convertToQueueObject\" to convert individuals to format for sending to queue")

	if(!localConfig.genomeType)
		throw new Error("win-IEC needs a genome type specified."); 

	self.behaviorGeneratorQueue = localConfig.behaviorGeneratorQueue;
	self.noveltyThread = localConfig.noveltyThread;
	self.convertToQueueObject = localConfig.convertToQueueObject;

	self.noveltyThread.on('setupNovelty', setupNovelty);
	self.noveltyThread.on('runGeneration', runGeneration);
	self.noveltyThread.on('pauseNovelty', threadPauseNoveltySearch);
	self.noveltyThread.on('error', handleNoveltyError);



	var novelEmitter = {};
	emitter(novelEmitter);

	self.sessionObject = {};

	self.inProgress = 0;
	self.generatedIndividuals = {};
	self.requestedIdentifiers = {};

	self.mostNovel = [];
	self.population = {};

	self.behaviorsInProgress = {};
	self.waitingBehaviors = 0;

	self.allCount = 0;

	self.uidCounter = 0;

	function cleanEvolution(genomeType)
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

	cleanEvolution(localConfig.genomeType)

	//what events do we need?
	self.requiredEvents = function()
	{
		return [
			"novelty:measureNovelty",
            "novelty:addPending",
            "novelty:clearArchive",
			"novelty:getArchive",
			"generator:createArtifacts",
			"schema:replaceParentReferences",
			"schema:getReferencesAndParents",
			"publish:publishArtifacts",
			// "evolution:getOrCreateOffspring",
			//in the future we will also need to save objects according to our save tendencies
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			//respond to load seed request -- for getting initial objects as parents
			"evolution:loadSeeds" : self.loadSeeds,
			"evolution:selectParents" : self.selectParents,
			"evolution:unselectParents" : self.unselectParents,
			"evolution:getNoveltyEmitter" : self.getNoveltyEmitter,
			"evolution:runNoveltySearch" : self.requestNovelIndividuals,
			"evolution:publishArtifact" : self.publishArtifact,
			"evolution:pauseNoveltySearch" : self.pauseNoveltySearch
		};
	}

	self.uniqueIDGenerator = function(count)
	{
		var uid = [];
		for(var i=0; i < count; i++)
		{
			//nothing else will create these IDs other than this plugin
			uid.push("naiec-"+ self.uidCounter++);
		}

		return uid;
	}

	self.chooseRandomSeed = function(seedMap)
	{
		var seedKeys = Object.keys(seedMap);
		var rIx = Math.floor(Math.random()*seedKeys.length);
		return seedKeys[rIx];
	}

	self.satisfyRequest = function(eid, artifact)
	{
		//emit this information -- and someone can subscribe to these real time events
		novelEmitter.emit('novelIndividual', eid, artifact);
	}

	self.getNoveltyEmitter = function(done)
	{
		done(undefined, novelEmitter);
	}
	//we take in a webworker queue to run the evolutionary search
	self.requestNovelIndividuals = function(identifiers)
	{
		//we need to setup novelty -- if it's running or not

		//mark the new identifiers in the array, as they'll be used to spawn new offspring
		for(var i=0; i < identifiers.length; i++) {
			self.requestedIdentifiers[identifiers[i]] = true;
		}

		//we need to tell our thread about this, it will handle request for starting/configuring novelty
		self.noveltyThread.sendMessage("request", {identifiers: identifiers});
	}

	self.pauseNoveltySearch = function()
	{
		//pause these things -- cause a stop
		self.noveltyThread.sendMessage("pauseNovelty");
	}

	//this is the real request to pause -- we need to cancel the queue in this case
	function threadPauseNoveltySearch()
	{
		//we need to cancel our jobs for our queue
		self.behaviorGeneratorQueue.cancelJobs();
	}

	function setupNovelty(){

		//grab a number of unique ids
		self.population = {};

		//grab our selected parents to initialize offspring with self.popsize number of individuals 
		//gets the intial population for win-novelty 
		self.createOffspring(self.populationSize)
			.then(function(offspringMap)
			{
				//for each wid in the offspring map, do stuff
				for(var key in offspringMap)
				{
					self.allCount++;
		 			self.generatedIndividuals[key] = offspringMap[key];
		 			self.population[key] = (offspringMap[key]);
				}

				//saved the objects, let it know we're done
		 		self.noveltyThread.sendMessage("finishSetupNovelty", {count: self.allCount});
			})

		
	}

	function runGeneration()
	{
		//we should have a bunch of individuals, we need to evaluate our current population
		self.waitingBehaviors = 0;

		var promises = [];

		for(var key in self.population)
		{
			var obj = self.population[key];

			var queueData = self.convertToQueueObject(obj);
			
			// self.waitingBehaviors++;

			//we need to convert all these objects into cppnouts -- our behaviors
			promises.push(sendToBehaviorQueue(key, queueData));
		}

		//DDFA
		// divergent discriminative feature accumulation


		//we'll get back some behavior arrays for calculating novelty when all finished
		var evaluatedBehaviors = {};

		var abortBehaviorCollection = false;

		//we wait for everything to finish being run before returning
		Q.all(promises)
		.then(function(behaviorPromises)
		{
			//going through all the behaviors, if any are null - that is an error, or it was abandoned
			for(var i=0; i < behaviorPromises.length; i++)
			{
				//now we have all our promises from the queue ready
				var rPromise = behaviorPromises[i];
				
				//if we have any data, we send it through
				if(rPromise.behaviors)
					evaluatedBehaviors[rPromise.key] = {behaviors: rPromise.behaviors};
				else
				{
					//this is an emergency abort triggered, we need to stop this function
					abortBehaviorCollection = true;
					break;
				}
			}

			if(abortBehaviorCollection)
				return;

			//now we have all of our bheaviors evaluations, let's measure novelty
			return self.backEmit.qCall("novelty:measureNovelty", evaluatedBehaviors)
		})
		.then(function(novelMeasurements)
		{
			if(abortBehaviorCollection)
				return;

			//now we have measure of novelty -- let's pull the best for this collection, 
			//then use that to create a new population
			//and we're done for this genreation
			var novelty = novelMeasurements.novelty;

			var novelpop = [];

			for(var key in novelty){
				novelty[key].noveltyID = key;
				novelpop.push(novelty[key]);
			}

			//sort by descending novelty
			novelpop.sort(function(a,b){return b.novelty - a.novelty;})

			//log this bugger, please
			self.log(novelpop);

			//now we're sorted by this, we pull out the number of novel objects per generation
			var novelObjects = [];

			for(var i=0; i < self.noveltyPerGeneration; i++){
				
				//which object is this related to?
				var key = novelpop[i].noveltyID;

				//grab the object itself
				novelObjects.push(self.population[key]);
			}

			//now we need to satisfy the requested objects
			handleNovelIndividuals(novelObjects);

			//now we use this novelty population to make selections
			var nextGenParents = selectParentsForNextGeneration(novelpop);


			return self.createOffspring(nextGenParents, self.populationSize);
		})
		.then(function(widOffspring)
		{
			if(abortBehaviorCollection)
				return;

			//got our offspring for the next generation
			self.population = {};

			for(var wid in widOffspring)
			{
				self.population[wid] = widOffspring[wid];
				self.evolutionObjects[wid] = widOffspring[wid];
			}

			//all done with the generation
	 		self.noveltyThread.sendMessage("finishRunGeneration", {novelObjectCount: self.noveltyPerGeneration});
		})
		.catch(function(err)
		{
			//got's to throw it if we catch it!
			throw err;
		});
	}
	
	//send back some novel individuals please-- we give back to the community
	function handleNovelIndividuals(novelIndividuals)
	{ 
		//emit the novel individuals, that is all
		for(var i=0; i < novelIndividuals.length; i++)
			novelEmitter.emit('novelIndividual', novelIndividuals[i]);
	}

	function selectParentsForNextGeneration(novelpop)
	{
		//these are our novel objects, we need only to make tournament selections for the parents

		var parents = {};
		var parentList = [];
		var pSize = novelpop.length;

		//as many parents as we're willing to accept
		var pCount = Math.min(self.maxParentSize, Math.floor(pSize*self.selectionPercentage));

		var maxSelectionAttempts = 10*pCount;
		var totalSelectionAttempts = 0;
		//for each required parent, we do tournament selection 
		// for(var i=0; i < pCount; i++)
		//avoid infinite loop, but make sure to get the desired amount
		while(parentList.length < pCount && totalSelectionAttempts++ < maxSelectionAttempts)
		{
			var r1 = wMath.next(pSize);
			var r2 = wMath.next(pSize);
			var cnt = 0;
			while(cnt++ < 4 && r1 == r2)
				r2 = wMath.next(pSize);

			//choose the object with more novelty as the parent
			var selectedIx = (novelpop[r1].novelty >= novelpop[r2].novelty ? r1 : r2);

			//if you have better novelty, add it to our parent list -- no dups
			if(!parents[selectedIx]){
				var p = self.population[novelpop[selectedIx].noveltyID];
				parents[selectedIx] = p;
				parentList.push(p);
			}
		}

		//all done, we have our tournament selected parents
		return parentList;
	}

	function sendToBehaviorQueue(key, jobData)
	{
		var defer = Q.defer();

		//queue up this object
		self.behaviorGeneratorQueue.queueJob(jobData, function(behaviorData)
		{
			//behavior data can be null
			defer.resolve({key: key, behaviors: behaviorData.allOutputs});
		});

		return defer.promise;
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

	self.createOffspring = function(parents, count)
	{
		//we give a promise for offspring -- it's an async process
		var defer = Q.defer();


		//without providing an array, we default to selected parents 
		if(typeof parents == "number" || !Array.isArray(parents))
		{
			count = parents;
			parents = self.getSelectedParents();
		}

		//we get some offspring objects in a map
		var widOffspring = {};

		//we need to go fetch some stuff
		self.backEmit.qCall("generator:createArtifacts", self.genomeType, count, parents, self.sessionObject)
			.then(function(artifacts)
			{
				//otherwise, let's do this thang! match artifacts to offspring -- arbitrary don't worry
				var off = artifacts.offspring;

				for(var i=0; i < off.length; i++)
				{
					var oObject = off[i];
					widOffspring[oObject.wid] = oObject;
				}

				return self.backEmit.qCall("schema:getReferencesAndParents", self.genomeType, widOffspring);
			})
			.then(function(refsAndParents)
			{
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

				//now we are done!
			})
			.done(function()
			{
				defer.resolve(widOffspring);

			}, function(err)
			{
				//pass on the error if it happened
				defer.reject(err);
			});

		return defer.promise;
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

	self.getSelectedParents = function()
	{
		var parents = [];

		for(var key in self.selectedParents)
			parents.push(self.selectedParents[key]);

		return parents;
	}

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
		var finalClones;

		//here is what needs to happen, the incoming evo object has the "wrong" parents
		//the right parents are the published parents -- the other parents 

		//this will need to be fixed in the future -- we need to know private vs public parents
		//but for now, we simply send in the public parents -- good enough for picbreeder iec applications
		//other types of applications might need more info.

		var widObject = {};
		widObject[evoObject.wid] = evoObject;
		self.backEmit.qCall("schema:getReferencesAndParents", self.genomeType, widObject)
		.then(function(refsAndParents){

			//now we know our references
			var refParents = refsAndParents[evoObject.wid];

			//so we simply fetch our appropraite seed parents 
			var evoSeedParents = self.noDuplicatSeedParents(refParents);

			//now we have all the info we need to replace all our parent refs
			return self.backEmit.qCall("schema:replaceParentReferences", self.genomeType, evoObject, evoSeedParents);
		})
		.then(function(cloned)
		{
			//now we have a cloned version for publishing, where it has public seeds
			finalClones = cloned;
			 //just publish everything public for now!
	        var session = {sessionID: self.evolutionSessionID, publish: true};

	        //we can also save private info
	        //this is where we would grab all the parents of the individual
	        var privateObjects = [];

			return self.backEmit.qCall("publish:publishArtifacts", self.genomeType, session, [cloned], []);
		})
		.catch(function(err)
		{
			throw err;
		})
		.done(function()
		{
			finished(undefined, finalClones);
		})
       
	}

	function handleNoveltyError(errEvent)
	{
		console.log("Novelty Thread error: ", errEvent);

	}



	return self;
}
