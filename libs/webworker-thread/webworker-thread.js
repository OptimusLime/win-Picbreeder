
var WebWorkerClass = require('worker');
var emitter = require('emitter');

module.exports = webworkerthread;

function webworkerthread(scriptName)
{ 
    var self = this;

    emitter(self);

    //if we're a string, load us up, if we're an object -- jsut accept the object!
    self.thread = (typeof scriptName == "string" ? new WebWorkerClass(scriptName) : scriptName);

    self.thread.on('message', messageCallback);
 
    function messageCallback(threadData)
    {
        //here we get a callback with the data, we basically emit the event from the thread
        if(threadData.event)
        {
            self.emit(threadData.event, threadData.data);
        }
    }

    self.sendMessage = function(event, data)
    {
        self.thread.send({event: event, data: data});
    }


    return self;
}
