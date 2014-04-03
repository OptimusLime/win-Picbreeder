//here we test the insert functions
//making sure the database is filled with objects of the schema type
// var wMath = require('win-utils').math;

var picbreederSchema = require("./picbreederSchema.js");

module.exports = pbEncoding;

function pbEncoding(backbone, globalConfig, localConfig)
{
	var self = this;

	//boom, let's get right into the business of encoding
	self.winFunction = "encoding";

    //for convenience, this is our artifact type
	self.encodingName = "picArtifact";

	self.log = backbone.getLogger(self);
	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	self.eventCallbacks = function()
	{ 
		return {
			// //easy to handle neat geno full offspring
			// "encoding:iesor-createNonReferenceOffspring" : function(genProps, parentProps, sessionObject, done) { 
				
   //              //session might be undefined -- depending on win-gen behavior
   //              //make sure session exists
   //              sessionObject = sessionObject || {};

			// 	//need to engage parent creation here -- could be complicated
			// 	var parents = parentProps.parents;

   //              //how many to make
			// 	var count = genProps.count;

   //              //these will be the final objects to return
			// 	var allParents = [];
			// 	var children = [];

			// 	//pull potential forced parents
			// 	var forced = sessionObject.forceParents;

   //              //go through all the children -- using parents or force parents to create the new offspring
   //              for(var c=0; c < count; c++)
   //              {
   //                  //we simply randomly pull environment from a parent
   //                  var randomParentIx = wMath.next(parents.length);

   //                  //if we have parents that are forced upon us
   //                  if(forced){
   //                      //pull random ix
   //                      var rIx = wMath.next(forced[c].length);
   //                      //use random index of forced parent as the actual ix
   //                      randomParentIx = forced[c][rIx];
   //                  }

   //                  //our child together!
   //                  var rOffspring = {};

   //                  //all we need to do (for the current schema)
   //                  //is to copy the environment
   //                  rOffspring.meta = JSON.parse(JSON.stringify(parents[randomParentIx].meta));

   //                  //just return our simple object with a randomly chosen environment
   //                  children.push(rOffspring);

   //                  //random parent was involved, make sure to mark who!
   //                  allParents.push([randomParentIx]);
   //              }

			// 	//done, send er back
			// 	done(undefined, children, allParents);

			//  	return; 
			//  }
		};
	};

	//need to be able to add our schema
	self.requiredEvents = function() {
		return [
			"schema:addSchema"
		];
	};

	self.initialize = function(done)
    {
    	self.log("Init win-iesor encoding: ", picbreederSchema);

		//how we talk to the backbone by emitting events
    	var emitter = backbone.getEmitter(self);

		//add our neat genotype schema -- loaded neatschema from another file -- 
		//this is just the standard neat schema type -- others can make neatjs changes that require a different schema
        emitter.emit("schema:addSchema", self.encodingName, picbreederSchema, function(err)
        {
        	if(err){
        		done(new Error(err));
        		return;
        	}
        	done();
        });
    }


	return self;
}