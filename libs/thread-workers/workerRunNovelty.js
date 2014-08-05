var emitter; 
var messageHandler;

if(typeof require != "undefined")
    emitter = require('emitter');

var NoveltyEvents = 
{
    newIndividual: "novelIndividual",
    requestIndividual: "request",
    setupNovelty : "setupNovelty",
    finishSetup : "finishSetupNovelty",
    runGeneration : "runGeneration",
    finishRunGeneration : "finishRunGeneration",
    pauseNovelty : "pauseNovelty"
}

var NoveltyStates = 
{
    blank : 0,
    initializing : 1,
    running : 2,
    pausing: 3,
    paused: 4,
    ending : 5,
    restarting: 6
}

if(typeof module != "undefined")
    module.exports = messageProcessingObject;

function messageProcessingObject()
{
    var self  = this;

    //start off in a blank state
    var currentState = NoveltyStates.blank;

    var novelObjectsRequested = 0;

    //add emission to us
    if(emitter)
        emitter(self);

    var realThread = (typeof require == "undefined");

    self.send = (realThread ? function(data)
    {
        messageProcess(data);
    } : 
    function(data)
    {
        //have to wrap the object when it's a fake thread for debugging purposes
        messageProcess({data: data});
    });


    self.threadPostMessage = (realThread ? postMessage : function(data){
        self.emit('message', data);
    });

    function messageProcess(e){

        try{


            var threadedData = e.data;

            var nEvent = threadedData.event;

            switch(nEvent)
            {
                case NoveltyEvents.requestIndividual:
                    newNoveltyRequest(threadedData.data);
                    break;
                case NoveltyEvents.finishSetup:
                    finishSetup();
                    break;
                case NoveltyEvents.pauseNovelty:
                    //rtigger an immediate pasue event
                    pauseNovelty();
                    break;
                 case NoveltyEvents.finishRunGeneration: 
                    finishRunGeneration(threadedData.data);
            }
        }
        catch(err)
        {
            console.log("Run Novelty error! ", err);
             // Send back the error to the parent page
            self.threadPostMessage({event: "error", data: {error: err.message, stack: err.stack}});
        }
    };

    function newNoveltyRequest(novelData)
    {
        //here, we request have requested to run novelty
        if(!novelData.identifiers || !Array.isArray(novelData.identifiers))
            throw new Error("Cannot request novel objects without array of identifiers");
        
        //no matter what state we're in, we'll need to record the extra 
        //requests for new data
        novelObjectsRequested += novelData.identifiers.length;

        //depending on our state, we behave differently
        switch(currentState)
        {
            case NoveltyStates.blank:

                //we are nothing! we must first setup to run
                currentState = NoveltyStates.initializing;

                //send a message saying we want novelty all setup/
                self.threadPostMessage({event: NoveltyEvents.setupNovelty, data : {}});
                break;
            case NoveltyStates.initializing:
            //nothing to be done, we're initializing, and when it finishes, we'll take care of the request
                break;
            case NoveltyStates.running: 
                break;
            case NoveltyStates.paused: 
                //we now need to start novelty back up -- where we left off
                unpauseNovelty();
                break;

        }
    }

    function finishSetup()
    {
        //now we've got to get everything ready to run --
        //we'll need to set timers that call regularly, 
        //to see if novelty is progressing
        currentState = NoveltyStates.running;
        runGeneration();
    }

    function runGeneration()
    {
        //we make a request to get the next genreation of objects evaluated
        self.threadPostMessage({event: NoveltyEvents.runGeneration, data: {}});
    }
    //here we've finished running our generation
    function finishRunGeneration(generationData)
    {
        //the question is, how many novel objects did we accumulate during the last generation?!?!?
        var foundObjects = generationData.novelObjectCount;

        //this tells us if we've found the required number of objects yet!
        novelObjectsRequested -= foundObjects;

        //don't go negative please
        novelObjectsRequested = Math.max(0, novelObjectsRequested);

        if(novelObjectsRequested == 0)
        {
            //pause evolution -- we don't need anymore individuals
            pauseNovelty();
            //don't do anything more, we're paused!
            return;
        }

        //if we're still short, we need to keep running!
        runGeneration();
    }

    function pauseNovelty()
    {
        currentState = NoveltyStates.paused;

        //send out info that we're pausing
        self.threadPostMessage({event: NoveltyEvents.pauseNovelty, data : {}});
    }

    function unpauseNovelty()
    {
        //let it be known we've started again!
        currentState = NoveltyStates.running;
        runGeneration();
    }
}

//if we are a thread we create an object,  and hook it up to the provided thread methods
//otherwise, we're creating on a single thread
if(typeof require == "undefined")
{
    messageHandler = new messageProcessingObject();

    onmessage = messageHandler.send;
    messageHandler.threadPostMessage = postMessage;
}

