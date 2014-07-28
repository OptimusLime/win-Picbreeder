
var Emitter = require('emitter');
var resize = require('resize');
var classes = require('classes');
var events = require('events');

var publish = require('publishui');

//
var element = require('el.js');

var flexstatic = require('flexstatic');
var flexparents = require('flexparents');
// var dimensions = require('dimensions');

module.exports = flexIEC; 

var uFlexID = 0;

function flexIEC(divValue, reqOptions)
{
	// console.log(divValue);
	var self = this;

	if(!reqOptions || !reqOptions.evoOptions  || !reqOptions.parentOptions)
		throw new Error("Can't use flexforever without options or objectSize");

	//deep clone the required options object
	reqOptions = JSON.parse(JSON.stringify(reqOptions));

	//someobody needs to tell us where to start the count 
	reqOptions.evoOptions.startIx = reqOptions.startIx || reqOptions.evoOptions.startIx || 0;

	self.bottomElementSize = reqOptions.bottomElementSize || 47;

	//need to add some space to our objects
	reqOptions.evoOptions.extraHeightPerObject = self.bottomElementSize;

	reqOptions.publishOptions = reqOptions.publishOptions || {objectSize: reqOptions.evoOptions.objectSize};

	//add emitter properties to this object
	Emitter(self);

	//add appropriate classes to our given div
	self.uid = "flexIEC" + uFlexID++;

	self.objectSize = reqOptions.objectSize;

	var iecBase = self.uid + "-#@#";
	var outerFlexID = iecBase.replace(/#@#/g, "container");
	
	//set the innerHTML of the supplied div to now be setup for swiper integration
	divValue.innerHTML = "<div id=" + outerFlexID + " class=\"iec-container flexIEC border\" style=\"height:100%;\">" 
	+ "</div>";

	var outerContainer = document.querySelector("#" + outerFlexID);


	//Out yo face, tell us when your changing sizes
	resize.bind(outerContainer, function()
	{
		// console.log('IEC Resize: ', outerContainer.offsetWidth, " height: ",)
	});

	//now we need to setup the parent section and the iec children section
	var container = element('div', {id: "test",  class: "container fullWH pOR"});	

	//simple test at first
	var row = element('div', {id: "test", class : "row mOR fullWH"});


	var parentFlexDiv, evoFlexDiv;

	var loadingIndividuals = {};
	var finishedLoading = {};
	var fullObjects = {};

	var parentObjects = {};



	self.createEvolutionGrid = function()
	{
		//build piece by piece the evo grid
		var rightColumn = element('div', {id: "evo-col", class: "col-auto fullWH colObject border mOR pOR"});
		var tabs = element('div', {id: "evoTabs", class : "tabs row mOR"});

		var evoBottom = element('div', {id: "evo-bot", class : "innerObject colObject"});
		evoFlexDiv = evoBottom;

		rightColumn.appendChild(tabs);
		rightColumn.appendChild(evoBottom);

		return rightColumn;
	}

	self.createParentList = function()
	{
		//creat the top level container
		var parentColumn = element('div', 
			{id: "parent-col", style: "width: " + (reqOptions.parentOptions.objectSize.width  + 25) + "px", 
			class: "col-xs-3 fullWH colObject border mOR pOR"});
		
		//then we break it into the title row, and the actual parent list object 
		var parentTopRow = element('div', {id: "p-top", class : ""});
		var parentBottomRow = element('div', {id: "p-bot", class : "innerObject colObject border"});

		var choice = element('div', {id: "p-top-choice", class : "border"});
		choice.innerHTML = "Parent Artifacts";

		//add the choice object to our top row (to have something to display)
		parentTopRow.appendChild(choice);
		parentColumn.appendChild(parentTopRow);
		parentColumn.appendChild(parentBottomRow);

		parentFlexDiv = parentBottomRow;

		return parentColumn;
	}

	//set it to like, then start parent creation process
	self.createParent = function(eID)
	{
		//create parent using element info
		self.parentFlex.addElement(eID);
	}
	self.deleteParent = function(eID)
	{
		var pObject = parentObjects[eID];

		//remove this object from our parent
		self.parentFlex.removeElement(pObject.pID);
	}

	//a parent has been removed!
	self.parentDeleted = function(evoID, pID)
	{
		var el = fullObjects[evoID];

		// console.log("Deleted parent: ", evoID, el);

		if(el)
		{
			var cl = classes(el);

			if(cl.has('like'))
				cl.toggle('like'); 
		}

		//delete parent using element info
		delete parentObjects[evoID];

		//let it be known wassup
		self.emit("parentUnselected", evoID);
	}

	var pSelected = function(evoID)
	{
		return function()
		{
			//don't really do anything after selecting parents
		};
	}

	self.parentCreated = function(evoID, parID, eDiv)
	{
		var el = fullObjects[evoID];
		if(el)
		{
			var cl = classes(el);

			if(!cl.has('like'))
				cl.toggle('like'); 
		}

		//when a parent is created, we make note
		parentObjects[evoID] = {pID: parID, el: eDiv};

		//make it known that this parent was selected for real -- we'll handle the UI
		self.emit("parentSelected", evoID, eDiv, pSelected(evoID));
	}

	self.likeElement = function(e)
	{
		//either you  or your parent have an ID -- pull that id info
		var tID = e.target.id || e.target.parentElement.id;

		//replace element name to get teh original eID
		var elementID = tID.replace(/-like/g, "");

		//already a parent, toggle -- remove parent
		if(parentObjects[elementID])
		{
			// console.log("Start delete parent: ", elementID)
			self.deleteParent(elementID);
		}
		else{
			// console.log("Start make parent: ", elementID)
			self.createParent(elementID);
		}


		//we toggle adding this to our parent objects
	}

	self.publishElement = function(e)
	{
		//either you  or your parent have an ID -- pull that id info
		var tID = e.target.id || e.target.parentElement.id;

		var elementID = tID.replace(/-publish/g, "");

		//launch a publish attempt using this ID
		self.publish.launchPublishModal(elementID);
	}

	self.createLoadingWrapper = function(eID)
	{
		var wrapDiv = element('div', {id: eID + "-wrap", class: "colObject"});
		var loadingDiv = element('div', {id: eID + "-object", class: "loading innerObject"});

		var bottomRow = element('div', {id: eID + "-bot", style : "height: " + self.bottomElementSize + "px;", class: "row mOR border"});

		//create a like button with an inner like div -- content == like graphic
		var likeButton = element('div', {id: eID + "-like", class: "col-auto pOR border"}, element('div', 'like'));
		var publishButton = element('div', {id: eID + "-publish", class: "col-auto pOR border"}, element('div', 'pub'));
	
		//create some managers...
		var likeManager = events(likeButton, self);
		var pubManager = events(publishButton, self);

		//bind click events to self.like and self.publish callbacks
		likeManager.bind('click', 'likeElement');
		pubManager.bind('click', 'publishElement');	


		bottomRow.appendChild(likeButton);
		bottomRow.appendChild(publishButton);

		wrapDiv.appendChild(loadingDiv);
		wrapDiv.appendChild(bottomRow);

		//send it back all done up
		return {full: wrapDiv, object: loadingDiv};
	}

	//create the left parent side

	// var parentColumn = element('div', {id: "parent-col", class: "col-xs-3 fullWH colObject border mOR pOR"});
	var pColumn = self.createParentList();
	var evoColumn = self.createEvolutionGrid();

	//append both columns to the iec object
	row.appendChild(pColumn);
	row.appendChild(evoColumn);

	container.appendChild(row);

	outerContainer.appendChild(container);



	//create our flex parent
	self.parentFlex = new flexparents(parentFlexDiv, reqOptions.parentOptions || {});

	self.parentFlex.on('elementCreated', self.parentCreated);
	self.parentFlex.on('elementRemoved', self.parentDeleted);


	//create the evolution grid -- self initializes
	self.evoFlex = new flexstatic(evoFlexDiv, reqOptions.evoOptions || {});

	self.activeParents = function(){return self.parentFlex.activeParents();};

	self.individualLoaded = function(eID)
	{
		return function()
		{
			//grab our loading individual using the ID
			var eDiv = loadingIndividuals[eID];

			//grab class information,
			var c = classes(eDiv);
			//use class info to toggle loading backgroung (if it still exists)
			if(c.has('loading'))
				c.toggle('loading');

			for(var i=0; i < eDiv.children.length; i++)
			{	
				var c = classes(eDiv.children[i]);
				if(c.has('loading'))
					c.toggle('loading');
			}

			finishedLoading[eID] = eDiv;
			//get rid of the other stuff
			delete loadingIndividuals[eID];
		}
	}

	self.evoFlex.on('elementCreated', function(eID, eDiv)
	{
		var wrapDiv = self.createLoadingWrapper(eID);
		
		eDiv.appendChild(wrapDiv.full);

		//save full object
		fullObjects[eID] = eDiv;

		//now officially loading this object
		loadingIndividuals[eID] = wrapDiv.object;

		self.emit('createIndividual', eID, wrapDiv.object, self.individualLoaded(eID));
	});

	self.evoFlex.on('elementVisible', function(eID)
	{
		console.log("Visible: ", eID);
		// element.className += "grid-cell";
		// eDiv.innerHTML = "<div>Vis: "+eID+"</div>";
	});

	self.evoFlex.on('elementHidden', function(eID)
	{
		console.log("Hidden: ", eID);
		// element.className += "grid-cell";
		// eDiv.innerHTML = "<div>Invis: "+eID+"</div>";
	});


	//signify that it's time to init everything
	self.ready = function()
	{
		self.evoFlex.initialize();
	}

	//deal with publishing	-- add in our publishing object according to publishUI setup
	self.publish = publish(reqOptions.publishOptions);

	//this is the real deal! We have what we need to publish
	self.publish.on('publishArtifact', function(eID, meta, finished)
	{
		//we now pass this on to those above us for proper publishing behavior
		self.emit('publishArtifact', eID, meta, finished);
	});

	self.publish.on('publishShown', function(eID, eDiv, finished){

		//we have space in eDiv for our objects (according to size already determined)
		//we have nothing to add to this info
		self.emit('publishShown', eID, eDiv, finished);
	});

	self.publish.on('publishHidden', function(eID, eDiv, finished){

		//we have space in eDiv for our objects (according to size already determined)
		//we have nothing to add to this info
		self.emit('publishHidden', eID);
	});



	return self;
}



