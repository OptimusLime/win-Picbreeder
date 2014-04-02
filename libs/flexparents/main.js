
var Emitter = require('emitter');
var resize = require('resize');
// var dimensions = require('dimensions');

module.exports = parentList; 

var uFlexID = 0;

function parentList(divValue, reqOptions)
{
	// console.log(divValue);
 
	var self = this;

	if(!reqOptions || !reqOptions.objectSize || !reqOptions.objectSize.width || !reqOptions.objectSize.height)
		throw new Error("Can't use flexforever without options or objectSize");

	//deep clone the required options object
	reqOptions = JSON.parse(JSON.stringify(reqOptions));

	//prepend the new objects
	self.append = reqOptions.append || false;

	//add emitter properties to this object
	Emitter(self);

	//add appropriate classes to our given div
	self.uid = "plist" + uFlexID++;

	self.objectSize = reqOptions.objectSize;
	// console.log(reqOptions.maxItemCount);
	//we auto determin
	self.autoDetermineMax = reqOptions.autoDetermineMax == undefined ? true : reqOptions.autoDetermineMax;

	self.maxItemCount = reqOptions.maxItemCount || Number.MAX_VALUE;

	reqOptions.extraHeightPerObject = reqOptions.extraHeightPerObject || 0;

	//add a certain amount to our height object to compensate for any additional padding
	self.objectSize.height = self.objectSize.height + reqOptions.extraHeightPerObject;

	var plistBase = self.uid + "-#@#";
	var outerFlexID = plistBase.replace(/#@#/g, "container");
	
	//set the innerHTML of the supplied div to now be setup for swiper integration
	divValue.innerHTML = "<div id=" + outerFlexID + " class=\"plist-container parentflex\" style=\"border: 1px solid black; height:100%;\">" 
	+ "</div>";


	var outerContainer = document.querySelector("#" + outerFlexID);

	var itemsPerColumn = function()
	{
		return Math.floor(outerContainer.offsetHeight/(self.objectSize.height + 2*(self.objectSize.columnMargin || 0 + self.borderSize)));
	}

	if(self.autoDetermineMax)
	{
		self.maxItemCount = itemsPerColumn();
		// console.log("Max items: ", self.maxItemCount);
	}

	resize.bind(outerContainer, function()
	{
		//we've received a resize event 
		//adjust element counts and the like
		if(self.autoDetermineMax)
			self.maxItemCount = itemsPerColumn();

		// console.log("Size change deteced, max items: ", self.maxItemCount);


		if(activeElements > self.maxItemCount)
		{
			//don't remove EVERYTHING -- need to leave 1 element no matter what size
			var max = Math.max(1, self.maxItemCount);

			for(var i = max; i < activeElements; i++)
			{
				//remove oldest first always -- however many times we need to do this
				self.removeOldest();
			}
		}
	})


	self.borderSize = 1;

	var nextItem = 0;
	var activeElements = 0;
	
	var htmlObjects = {};
	var dataObjects = {};

	//internal create the parent
	function internalCreate(i, data)
	{
		// console.log("\t\thapkjsdflkjsdflkjsdlfkj: calling create: ", i, " d: ", data)
		var el = createElement(i);
		htmlObjects[i] = el;
		dataObjects[i] = data;
		activeElements++;
		self.emit('elementCreated', data, i, el);
		return el;
	}

	self.activeParents = function(){return activeElements;};

	//really simple, just append to our container a new element
	self.addElement = function(data)
	{
		var newID = nextItem++;

		var el = internalCreate(newID, data);

		// console.log("activeElements: ", activeElements, " count: ", self.maxItemCount)
			//need to remove the lowest element
		if(activeElements > self.maxItemCount)
			self.removeOldest();

		//prepend
		if(!self.append)
			outerContainer.insertBefore(el, outerContainer.firstChild);
		else //otherwise we're appending the object
			outerContainer.append(el);
	}
	self.removeOldest = function()
	{
		var keys = Object.keys(htmlObjects);
		keys.sort(function(a,b){return parseInt(a) - parseInt(b);});

		//grab the lowest key we have
		var rmKey = keys[0];

		//now we remove that object at the bottom of the list
		self.removeElement(rmKey);		
	}

	self.removeElement = function(id)
	{
		// console.log("Removing: ", id);
		//get the object from our list of objects
		var el = htmlObjects[id];
		var data = dataObjects[id];

		//minus an element
		activeElements--;

		//let it be known, it's over! We're about to remove the parent
		self.emit('elementRemoved', data, id);

		//remove the object!
		outerContainer.removeChild(el);

		delete htmlObjects[id];
		delete dataObjects[id];

	}

	self.removeRandom = function()
	{
		var keys = Object.keys(htmlObjects);
		var rmIx = Math.floor(Math.random()*keys.length);

		//jusst remove something random -- for testing purposes
		self.removeElement(keys[rmIx]);
	}

	var objectIDToUID = function(idCount)
	{
		return self.uid + "-object-" + idCount;
	}

	var getElement = function(ix)
	{
		var objectUID = objectIDToUID(ix);
		return htmlObjects[objectUID];
	}

	//create an element from scratch (using the given identifier)
	var createElement = function(ix)
	{
		var element = document.createElement('div');
		var objectUID = objectIDToUID(ix);

		element.id = objectUID;
		element.style.width = self.objectSize.width + "px";
		element.style.height = self.objectSize.height + "px";

		element.style.marginLeft = self.objectSize.rowMargin + "px" || 0;
		element.style.marginRight = self.objectSize.rowMargin + "px" || 0;

		element.style.marginTop = self.objectSize.columnMargin + "px" || 0;
		element.style.marginBottom = self.objectSize.columnMargin + "px" || 0;

		// element.style.border = (self.borderSize ? (self.borderSize + "px solid black") : 0);

		//make it a border class element
		element.className += "border pobject";

		element.style.overflow = "hidden";

		return element;
	}

	return self;
}



