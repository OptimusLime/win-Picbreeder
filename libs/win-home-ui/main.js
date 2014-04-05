
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

		var th2 = document.createElement('h1');
		th2.innerHTML = title;

		var tEl = element('div', {style: "font-size: 2em;"}, th2);

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

	self.createElement = function(wid, category, options)
	{

		var size = options.objectSize || {width: 150, height: 150};

		var addWidth = options.additionalElementWidth || 0;
		var addHeight = options.additionalElementHeight || 50;

		var trueElementSize = "width: " + (size.width) + "px; height: " + (size.height) + "px;"; 
		var fullWidthAndHeight = "width: " + (size.width + addWidth) + "px; height: " + (size.height + addHeight) + "px;"; 
		var id = category + "-" + wid;

		//for now, everything has a border! 

		//now we add some buttons
		var aImg = element('div', {style: trueElementSize, class: "border"});
		var evoBut = element('div', {style: "", class: "homeElementButton border"}, "Branch");
		var history = element('div', {style: "", class: "homeElementButton border"}, "Ancestors");

		//this is where the artifact stuff goes
		var aElement = element('div', {style: fullWidthAndHeight, class: "border"}, [aImg, evoBut, history]); 

		var simpleElement = element('div', {id:id, class: "home"}, [aElement]);



		//we also need to add on some extra space for buttons buttons buttons ! need to branch and stuff

		return {full: simpleElement, artifactElement: aImg, branch: evoBut, ancestors: history};
	}

	self.emitElementCreation = function(emit, wid, artifact, eDiv)
	{
		//let 
		emit.emit("elementCreated", wid, artifact, eDiv, function()
		{
			//maybe we do somehitng her in the future -- nuffin' for now gov'nor
		});
	}

	self.clickBranchButton  = function(emit, wid, artifact, eDiv)
	{
		eDiv.addEventListener('click', function()
		{
			emit.emit("artifactBranch", wid, artifact, eDiv);
		});
	}

	self.clickAncestorsButton  = function(emit, wid, artifact, eDiv)
	{
		eDiv.addEventListener('click', function()
		{
			emit.emit("artifactAncestors", wid, artifact, eDiv);
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

		self.log("Item query - start: ", itemStart, " end: ", (itemStart + itemsToDisplay));


		//then we make a query request
		self.backEmit("query:getHomeQuery", itemStart, (itemStart + itemsToDisplay), function(err, categories)
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

				var catTitle = document.createElement('h2');
					catTitle.innerHTML = cat;
				var catTitle = element('div', {}, [catTitle, elWrapper]);

				home.appendChild(catTitle);

				//now we let it be known we're creeating elelemtns
				var arts = categories[cat].artifacts;

				for(var i=0; i < arts.length; i++)
				{
					var artifact = arts[i];
					var wid = artifact.wid;

					var elObj = self.createElement(wid, cat, options);

					//add this object to our other elements in the category list
					elWrapper.appendChild(elObj.full);

					self.clickBranchButton(emit, wid, artifact, elObj.branch);
					self.clickAncestorsButton(emit, wid, artifact, elObj.ancestors);

					self.emitElementCreation(emit, wid, artifact, elObj.artifactElement);
				}
			}
			if(finished)
				finished();

		});
	}

	return self;
}



