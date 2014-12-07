//contains the neat schema setup -- default for neatjs stuff.

//Need a way to override schema inside WIN -- for now, neat comes with its own schema. Will be able to add variations later
//(for things looking to add extra neat features while still having all the custom code). 

//Alternatively, they could just copy this module, and add their own stuff. Module is small. 
 
module.exports = {
    "nodes": {
        "type" : "array",
        "gid": "String",
        "step": {"type": "Number"},
        "activationFunction": "String",
        "nodeType": "String",
        "layer": {"type": "Number"},
        "bias" : {"type": "Number"}
    },
    "connections": {
        "type" : "array",
        "gid" : "String",
        // "step": {"type": "Number"},

        "sourceID": "String",
        "targetID": "String",
        "weight": "Number"
    }
};


