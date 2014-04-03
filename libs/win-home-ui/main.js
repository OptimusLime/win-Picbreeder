
var emitter = require('emitter');
var element = require('el.js');
// var dimensions = require('dimensions');

module.exports = winhome; 

var uFlexID = 0;

function winhome(backbone, globalConfig, localConfig)
{
	// console.log(divValue); 
	var self = this;

	self.winFunction = "ui";

	self.backEmit = backbone.getEmitter(self);
	self.log = backbone.getLogger(self);

	//add appropriate classes to our given div

	self.uid = "home" + uFlexID++;

	var emitterIDs = 0;
	self.uiEmitters = {};
	self.homeElements = {};


	self.requiredEvents = function(){return ["query:getHomeQuery"];};

	self.eventCallbacks = function()
	{
		return {
			"ui:home-initializeDisplay" : self.initializeDisplay,
			"ui:home-ready" : self.ready
		}

	}

	self.initializeDisplay = function(div, options, finished)
	{
		if(typeof options == "function")
		{
			finished = options;
			options = {};
		}
		else //make sure it exists
			options = options || {};

		var homeHolder = element('div.winhome');

		var title = options.title || "WIN Domain (customize with title option)"; 

		var tEl = element('h1', {style: "font-size: 4em;"}, title);
		homeHolder.appendChild(tEl);
		
		var uID = emitterIDs++;
		var uie = {uID: uID};
		emitter(uie);

		self.uiEmitters[uID] = uie;
		self.homeElements[uID] = homeHolder;

		div.appendChild(homeHolder);

		//all done making the display -- added a title and some stuff dooooooop
		finished(undefined, {ui: homeHolder, emitter: uie, uID: uID});
		
	}

	self.createElement = function(wid, category, size)
	{
		var widthAndHeight = "width: " + size.width + "px; height: " + size.height + "px;"; 
		var id = category + "-" + wid;

		//for now, everything has a border! 
		var simpleElement = element('li', {id:id, style: widthAndHeight, class: "border"});

		//we also need to add on some extra space for buttons buttons buttons ! need to branch and stuff

		return {full: simpleElement, artifactElement: simpleElement};
	}

	self.emitElementCreation = function(emit, wid, artifact, eDiv)
	{
		//let 
		emit.emit("elementCreated", wid, artifact, eDiv, function()
		{
			//maybe we do somehitng her in the future -- nuffin' for now gov'nor
		});
	}


	self.ready = function(uID, options, finished)
	{
		if(typeof options == "function")
		{
			finished = options;
			options = {};
		}
		else //make sure it exists
			options = options || {};


		//pull the emitter for letting know about new objects
		var emit = self.uiEmitters[uID];
		var home = self.homeElements[uID];

		//okay let's setup up everything for real
		var itemStart = options.itemStart || 0;
		var itemsToDisplay = options.itemsToDisplay || 10;

		var objSize = options.objectSize || {width: 150, height: 150};

		//then we make a query request
		self.backEmit("query:getHomeQuery", itemStart, itemsToDisplay, function(err, categories)
		{
			//all the categories returned from the home query, and associated objects
			if(err)
			{
				finished(err);
				return;
			}

			console.log("Ready home query ret: ", categories);


			for(var cat in categories)
			{
				//set up the category title section
				var elWrapper = element('ul#' + cat + "-" + uID, {class: "thumbwrap"});

				var catTitle = element('h2', {}, [cat, elWrapper]);

				home.appendChild(catTitle);

				//now we let it be known we're creeating elelemtns
				var arts = categories[cat].artifacts;

				for(var i=0; i < arts.length; i++)
				{
					var artifact = arts[i];

					var elObj = self.createElement(artifact.wid, cat, objSize);

					//add this object to our other elements in the category list
					elWrapper.appendChild(elObj.full);

					self.emitElementCreation(emit, artifact.wid, artifact, elObj.artifactElement);
				}
			}
			if(finished)
				finished();

		});
	}

	return self;
}



