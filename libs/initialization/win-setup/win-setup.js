//here we test the insert functions
//making sure the database is filled with objects of the schema type
// var wMath = require('win-utils').math;

module.exports = winsetup;

function winsetup(requiredEvents, moduleJSON, moduleConfigs, finished)
{ 
    var winback = require('win-backbone');

    var Q = require('q');

    var backbone, generator, backEmit, backLog;

    var emptyModule = 
    {
        winFunction : "experiment",
        eventCallbacks : function(){ return {}; },
        requiredEvents : function() {
            return requiredEvents;
        }
    };

    //add our own empty module onto this object
    moduleJSON["setupExperiment"] = emptyModule;
    
    var qBackboneResponse = function()
    {
        var defer = Q.defer();
        // self.log('qBBRes: Original: ', arguments);

        //first add our own function type
        var augmentArgs = arguments;
        // [].splice.call(augmentArgs, 0, 0, self.winFunction);
        //make some assumptions about the returning call
        var callback = function(err)
        {
            if(err)
            {
              backLog("QCall fail: ", err);
                defer.reject(err);
            }
            else
            {
                //remove the error object, send the info onwards
                [].shift.call(arguments);
                if(arguments.length > 1)
                    defer.resolve(arguments);
                else
                    defer.resolve.apply(defer, arguments);
            }
        };

        //then we add our callback to the end of our function -- which will get resolved here with whatever arguments are passed back
        [].push.call(augmentArgs, callback);

        // self.log('qBBRes: Augmented: ', augmentArgs);
        //make the call, we'll catch it inside the callback!
        backEmit.apply(backEmit, augmentArgs);

        return defer.promise;
    }

    //do this up front yo
    backbone = new winback();

    backbone.logLevel = backbone.testing;

    backEmit = backbone.getEmitter(emptyModule);
    backLog = backbone.getLogger({winFunction:"experiment"});
    backLog.logLevel = backbone.testing;

    //loading modules is synchronous
    backbone.loadModules(moduleJSON, moduleConfigs);

    var registeredEvents = backbone.registeredEvents();
    var requiredEvents = backbone.moduleRequirements();
      
    backLog('Backbone Events registered: ', registeredEvents);
    backLog('Required: ', requiredEvents);

    backbone.initializeModules(function(err)
    {
      backLog("Finished Module Init");
      finished(err, {logger: backLog, emitter: backEmit, backbone: backbone, qCall: qBackboneResponse});
    });
}