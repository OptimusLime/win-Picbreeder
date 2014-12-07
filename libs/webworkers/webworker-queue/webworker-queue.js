
var WebWorkerClass = require('worker');

module.exports = webworkerqueue;

function webworkerqueue(scriptName, workerCount)
{ 
    var self = this;

    self.nextWorker = 0;
    
    //queue to pull from 
    self.taskQueue = [];
    self.taskCallbacks = {};

    //store the web workers
    self.workers = [];

    //how many workers available
    self.availableWorkers = workerCount;

    //note who is in use
    self.inUseWorkers = {};
    
    //and the full count of workers
    self.totalWorkers = workerCount;

    for(var i=0; i < workerCount; i++){

        var webworker = new WebWorkerClass(scriptName);

        //create a new worker id (simply the index will do)
        var workerID = i;

        //label our workers
        webworker.workerID = workerID;

        //create a webworker message callback unique for this worker
        //webworker in this case is not a raw webworker, but an emitter object -- so we attach to the message object
        webworker.on('message', uniqueWorkerCallback(workerID));

        //store the worker inside here
        self.workers.push(webworker);
    }


    function uniqueWorkerCallback(workerID)
    {
        return function(data){
            //simply pass on the message with the tagged worker
            workerMessage(workerID, data);
        }
    }

    function getNextAvailableWorker()
    {
        //none available, return null
        if(self.availableWorkers == 0)
            return;

        //otherwise, we know someone is available
        setNextAvailableIx();

        //grab the next worker available
        var worker = self.workers[self.nextWorker];

        //note that it's now in use
        self.inUseWorkers[self.nextWorker] = true;

        //less workers available
        self.availableWorkers--;

        //send back the worker
        return worker;
    }

    function setNextAvailableIx()
    {
        for(var i=0; i < self.totalWorkers; i++)
        {
            //check if it's in use
            if(!self.inUseWorkers[i])
            {
                self.nextWorker = i;
                break;
            }
        }
    }

    //this function takes a workerID and a data object -- called from the worker
    function workerMessage(workerID, data)
    {
        //we got our message, we pass it for callback

        //we know what workerID, so pull the associated callback
        var cb = self.taskCallbacks[workerID];

        //now remove all things associated with the task
        delete self.taskCallbacks[workerID];

        //free the worker
        delete self.inUseWorkers[workerID];

        //now on the market :)
        self.availableWorkers++;

        //prepare the callback -- if it exists
        if(cb)
        {
            //send the data back, pure and simple
            cb(data);
        }

        //now, do we have any queue events waiting?
        if(self.taskQueue.length > 0)
        {
            //now we need to process the task
            var taskObject = self.taskQueue.shift();

            //okay, queue it up! -- this should work immediately becuase we just freed a worker
            self.queueJob(taskObject.data, taskObject.callback);
        }
    }


    self.queueJob = function(data, callback)
    {

        //if we have any available workers, just assign it directly, with a callback stored
        var worker = getNextAvailableWorker();

        if(worker)
        {
            //we have a worker to issue commands to now
            //this is the callback we engage once the message comes back
            self.taskCallbacks[worker.workerID] = callback;

            //send the data now, thanks -- we'll handle callback in workerMessage function
            worker.send(data);
        }
        else
        {   
            //otherwise, we need to add the item to the queue
            self.taskQueue.push({data: data, callback: callback});
            //the queue is cleared when the other workers return from their functions
        }
    }

}
