
var Emitter = require('emitter');
// var dimensions = require('dimensions');

module.exports = flexstatic; 

var uFlexID = 0;


function flexstatic(divValue, reqOptions)
{
	// console.log(divValue);
 
	var self = this;

	console.log("POP POP!!d!");

	if(!reqOptions || !reqOptions.objectSize || !reqOptions.objectSize.width || !reqOptions.objectSize.height)
		throw new Error("Can't use flexforever without options or objectSize");

	//deep clone the required options object
	reqOptions = JSON.parse(JSON.stringify(reqOptions));

	//add emitter properties to this object
	Emitter(self);

	//add appropriate classes to our given div
	self.uid = "iec" + uFlexID++;

	self.objectSize = reqOptions.objectSize;

	reqOptions.extraHeightPerObject = reqOptions.extraHeightPerObject || 0;

	//for external ids, where should we start -- not necessarily 0!
	self.startIx = reqOptions.startIx || 0;

	//add a certain amount to our height object to compensate for any additional padding
	self.objectSize.height = self.objectSize.height + reqOptions.extraHeightPerObject;

	var fstatBase = self.uid + "-fstatic-#@#";
	var outerFlexID = fstatBase.replace(/#@#/g, "container");
	var wrapFlexID = fstatBase.replace(/#@#/g, "wrapper");
	
	//console check!
	// console.log('Base: ', fstatBase, " contain: ", outerFlexID, " wrap: ", wrapFlexID);

	//set the innerHTML of the supplied div to now be setup for swiper integration
	divValue.innerHTML = "<div id=\"" + outerFlexID + "\" class=\"fstat-container\">" + 
	// "<div id=" + wrapFlexID + " class=\"fstat-wrapper\">" + 
	// "</div>" +
	"</div>";

	self.borderSize = 1;

	// console.log(divValue.innerHTML);

	// var innerWrapper = document.querySelector("#" + wrapFlexID);
	var outerContainer = document.querySelector("#" + outerFlexID);
	// var dimWrapper = dimensions(innerWrapper);

	var itemsPerRow = function()
	{
		// console.log("Outer: ", outerContainer.offsetWidth, " objects: " , (self.objectSize.width + 2*(self.objectSize.rowMargin || 0 )));
		return Math.floor(outerContainer.offsetWidth/(self.objectSize.width + 2*(self.objectSize.rowMargin || 0)));
	}

	var itemsPerColumn = function()
	{
		return Math.floor(outerContainer.offsetHeight/(self.objectSize.height + 2*(self.objectSize.columnMargin || 0)));
	}

	var maxItemsPerPage = function()
	{
		//the number = number holdable in a row * number of columns
		//at least 1 will be created -- old code -- maybe later
		return Math.max(itemsPerRow()*itemsPerColumn(), 0);// 1);
	}

	var itemsOnPage, itemStart, flexInner;

	var htmlObjects = {};
	var itemCount = 0;
	var itemsOnScreen = 0;

	var init = false;
	self.initialize = function()
	{
		// console.log("Begin init!");
		if(init)
			return;

		//don't do this multiple times
		init = true;

		var flexID = self.uid + "-flex-inner";
		outerContainer.innerHTML = "<div id=\"" + flexID + "\" class=\"flexvcenter\" style=\"border: 1px solid black; height:100%;\"></div>";

		flexInner = document.querySelector("#"+flexID);

		//need to fill our current box with everything we can fit
		var maxIPP = maxItemsPerPage();

		itemStart = 0;


		for(var i=0; i < maxIPP; i++)
		{
			var el = internalCreate(i);
			itemsOnScreen++;
			flexInner.appendChild(el);
		}
	}

	function externalID(i)
	{
		return i + self.startIx;
	}

	function internalCreate(i)
	{
		var el = createElement(i);
		htmlObjects[i] = el;
		itemCount++;
		self.emit('elementCreated', externalID(i), el);
		return el;
	}


	self.removeExcessChildren = function()
	{
		var aRemove = [];
		//if you have too many chilrdren, the extras have to go!
		for(var i = itemsOnScreen; i < flexInner.children.length; i++)
		{
			aRemove.push(flexInner.children[i]);
		}
		aRemove.forEach(function(rm)
		{
			flexInner.removeChild(rm);
		});
	}
	self.previousPage = function()
	{
		//no going left when no more room
		if(itemStart == 0)
			return;
		//we're going to the previous page -- this won't require creating a bunch of elements
		var maxIPP = maxItemsPerPage();

		//hide the current elements
		for(var i= itemStart; i < itemStart + itemsOnScreen; i++)
		{
			self.emit('elementHidden', externalID(i), htmlObjects[i]);
		}

		//we can't go below 0!
		var movement = Math.min(itemStart, maxIPP);

		//going backwards a mighty step!
		itemStart -= movement;

		//items on csreen changes
		itemsOnScreen = movement;

		//Loop through and pull the relevant children
		for(var i=itemStart; i < itemStart + movement; i++)
		{
			var el = htmlObjects[i];
			self.emit('elementVisible', externalID(i));

			if(flexInner.children.length > i - itemStart)
				//replace the children of our container
				flexInner.replaceChild(el, flexInner.children[i-itemStart]);
			else
				flexInner.appendChild(el);	
		}

		self.removeExcessChildren();
	}

	self.nextPage = function()
	{
		//we're going to the next page -- this might require creating a new bunch of elements
		var maxIPP = maxItemsPerPage();

		console.log("Maxpp: ", maxIPP);

		//hide the current elements
		for(var i= itemStart; i < itemStart + itemsOnScreen; i++)
		{
			self.emit('elementHidden', externalID(i), htmlObjects[i]);
		}

		//now let's move to the next page
		itemStart += itemsOnScreen;

		//reset items on screen 
		itemsOnScreen = maxIPP;

		//and create if necessary
		for(var i=itemStart; i < itemStart + maxIPP; i++)
		{
			var el = htmlObjects[i];
			
			//we already made this object
			if(el)
			{
				self.emit('elementVisible', externalID(i), el);
			}
			else
			{
				el = internalCreate(i);
			}

			//replace the child -- or append it depending on circumstances
			if(flexInner.children.length > i - itemStart)
				flexInner.replaceChild(el, flexInner.children[i-itemStart]);
			else
				flexInner.appendChild(el);	
		}

		self.removeExcessChildren();
	}

	var objectIDToUID = function(idCount)
	{
		return self.uid + "-object-" + externalID(idCount);
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
		element.className += "border";

		element.style.overflow = "hidden";

		return element;
	}

	return self;
}



