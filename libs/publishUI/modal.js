
var modal = require('modal');
var emitter = require('emitter');
var element = require('el.js');
var pillbox = require('pillbox');
var classes = require('classes');

      
module.exports = function(options)
{	
	var self = this;

	//have emit capabilities -- let other know when certain events are triggered
	emitter(self);

	//given a div, we need to make our publishing adjustments
	if(!options.objectSize)
		throw new Error("Need object size for publish view!");

	var modalNames = {
		bPublish: "modal-publish",
		bCancel: "modal-cancel",
		iTitle: "modal-title",
		iTags : "modal-tags",
		dArtifact : "modal-artifact-object",
		dTop : "modal-top",
		dBottom: "modal-bottom",
		dParent : "modal-parent"
	}


	//now, we setup our div objects
	self.createModalWindow = function()
	{
		//we need to make a full blown UI and hook it up to events that will be emitted

		var div = element('div', {id: modalNames.dParent, class: "container fullSize flexContainerColumn"});

		var row = element('div', {id: modalNames.dTop, class: "noPadding flexRow flexSeparate"});

		var titleObject = element('div', {class: "title fullWidth flexContainerRow noPadding"}, 
			[ 
				element('div', {class: "col-xs-3 noPadding"}, 'Title: '),
				element('input', {id: modalNames.iTitle, type : "text", class: "col-auto noPadding titleText"})
			]);

		var tagObject = element('div', {id: "tag-holder", class: "fullSize flexContainerRow noPadding"}, 
			[
				element('div', {class: "col-xs-3 noPadding"}, 'Tags: '),
				element('input', {id: modalNames.iTags, type: "text", class: "col-auto noPadding"})
			]);

		var rightColumn = element('div', {id: "text-col"}, [titleObject, tagObject]);


		var widthAndHeight = "width: " + options.objectSize.width + "px; height: " + options.objectSize.height + "px;"; 
		var leftColumn = element('div', {id: "art-col", class: "col-xs-5"}, element('div', {id: modalNames.dArtifact, style: widthAndHeight, class: "border"}, "artifact here"));

		row.appendChild(leftColumn);
		row.appendChild(rightColumn);


		var pubButton = element('div', {id: modalNames.bPublish, class: "col-auto modalButton publish centerRow"}, "Publish");
		var cancelButton = element('div', {id: modalNames.bCancel, class: "col-auto modalButton cancel centerRow"}, "Cancel");

		var bottom = element('div', {id: modalNames.dBottom, class: "noPadding fullWidth flexContainerRow flexSeparate"}, [pubButton, cancelButton]);

		//now add the top row
		div.appendChild(row);
		div.appendChild(bottom);

		return div;
	}

	var div = self.createModalWindow();

	//do we need this piece?
	document.body.appendChild(div);

	var artifactDiv = document.getElementById(modalNames.dArtifact);

	var title = document.getElementById(modalNames.iTitle);
	//add tags to artifact-tag object
	var tags = document.getElementById(modalNames.iTags);

	var input = pillbox(tags, { lowercase : true, space: true });
	classes(tags.parentNode)
		.add("col-auto")
		.add("noPadding");

	//now we add listeners for publish/cancel
	var pub = document.getElementById(modalNames.bPublish);

	pub.addEventListener('click', function()
	{
		//for right now, we just close the modal
		self.publishArtifact();
	})

	var cancel = document.getElementById(modalNames.bCancel);
	cancel.addEventListener('click', function()
	{
		//for right now, we just close the modal
		self.cancelArtifact();
	})

	var view = modal(div)
		.overlay()
	    .effect('fade-and-scale');


    var currentID;

    self.launchPublishModal = function(eID)
    {
    	if(currentID != eID)
    	{
    		//clear tag and titles
    		tags.value = "";
    		title.value = "";
    	}
    	currentID = eID;
    	view.show();

    	var fc;
    	while((fc = artifactDiv.firstChild) != undefined)
    	{
    		artifactDiv.removeChild(fc);
    	}

    	//showing an object with a given id -- removed the innards for replacement
    	self.emit("publishShown", eID, artifactDiv, function()
		{
			//this doesn't have to be called, but it's good to be in the habbit -- since we may also want to display a loading gif
		});
    }

    self.cancelArtifact = function()
    {
    	view.hide();
    	self.emit("publishHidden", currentID);
    }

    self.publishArtifact = function()
    {
    	if(!self.hasListeners("publishArtifact"))
    	{
    		console.log("Warning: No listeners for publishing");
    		view.hide();
    	}
    	else{
    		var meta = {title: title.value, tags: input.values()};
	    	self.emit("publishArtifact", currentID, meta, function()
	    	{
	    		//when finished -- hide the mofo!p
	    		view.hide();
	    	});
	    }
    }


     return self;
}
