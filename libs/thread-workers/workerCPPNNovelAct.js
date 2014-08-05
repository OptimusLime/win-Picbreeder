var emitter; 
var messageHandler;

if(typeof require != "undefined")
    emitter = require('emitter');

var base64 = {};
var generateBitmap = {};

if(typeof module != "undefined")
    module.exports = messageProcessingObject;

function messageProcessingObject()
{
    var self  = this;

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

            //grab our function data
            var funData = e.data;

            //grab the wid
            var wid = funData.wid;

            var nodeOrder = funData.nodeOrder;
            var biasCount = funData.biasCount;
            var outputCount = funData.outputCount;
            var stFun = funData.stringFunctions;

            if(!nodeOrder || !biasCount || !outputCount || !stFun)
                throw new Error("Improper worker message sent. Need Node Order, Bias and OutputCounts, and String Functions for network");

            var nodeFunctions = {};
            //now we can create a contained function
            for(var id in stFun)
            {
                //replace string with function object
                nodeFunctions[id] = new Function([], stFun[id]);
            }


            //now we create a function that takes inputs, and runs the CPPN. BIATCH
            var cppnFunction = containCPPN(nodeOrder, nodeFunctions, biasCount, outputCount);


            //need with and height, thank you! non-zero ddoy
            if(!wid || !funData.width || !funData.height)
                throw new Error("No wid, width, or height provided for fixed size CPPN Activation");

            //okay, now we have our CPPN all pampered and ready to go
            var cppnOutputs = runCPPNAcrossFixedSize(cppnFunction, {width: funData.width, height: funData.height});

            var allActivations = [];

            var avg = 0;
            for(var i=0; i < cppnOutputs.length; i++)
            {
                var row  = cppnOutputs[i];
                for(var r=0; r < row.length; r++)
                {
                    var rgb = row[r];
                    //convert to grayscale
                    var grayScale = .21*rgb[0] + .72*rgb[1] + .07*rgb[2];
                    allActivations.push(grayScale);
                    avg += grayScale;
                    // for(var c=0; c < rgb.length; c++)
                        // allActivations.push(rgb[c]);
                }
            }

            //divide sum by activaiton length for avg! 
            avg /= allActivations.length;
            
            // var stdDev = 0;
            // var delta;
            // for(var i=0; i < allActivations.length; i++)
            // {
            //     delta = (allActivations[i] - avg);
            //     stdDev += delta*delta;
            // }
            // //divide standard deviation by activaiton length
            // stdDev /= allActivations.length;

            // //if we have 0 std dev -- then we're all the same number -- just set 1 so we don't divide by zero 
            // if(stdDev == 0)
            //     stdDev = 1;

            // var rep;

            // //now we zscore noralize the results
            // for(var i=0; i < allActivations.length; i++)
            // {
            //     rep = (allActivations[i] - avg)/stdDev;
            //     allActivations[i] = rep;
            // }

            //cppn outputs to RGB Bitmap -- huzzah!
            // var fileOutput = generateBitmap.generateBitmapDataURL(cppnOutputs);

            //send back our data, we'll have to loop through it and convert to bytes, but this is the raw data
            self.threadPostMessage.apply(this, [{wid: wid, allOutputs: allActivations, width: funData.width, height: funData.height}])
        }
        catch(err)
        {
             // Send back the error to the parent page
            self.threadPostMessage.apply(this, [{error: err.message, stack: err.stack}]);
        }
    }


    return self;
}   

//if we are a thread we create an object,  and hook it up to the provided thread methods
//otherwise, we're creating on a single thread
if(typeof require == "undefined")
{
    messageHandler = new messageProcessingObject();

    onmessage = messageHandler.send;
    messageHandler.threadPostMessage = postMessage;
}

function containCPPN(nodesInOrder, functionsForNodes, biasCount, outputCount)
{
    return function(inputs)
    {
        var bias = 1.0;
        var context = {};
        context.rf = new Array(nodesInOrder.length);
        var totalIn = inputs.length + biasCount;

        for(var i=0; i < biasCount; i++)
            context.rf[i] = bias;

        for(var i=0; i < inputs.length; i++)
            context.rf[i+biasCount] = inputs[i];


        for(var i=0; i < nodesInOrder.length; i++)
        {
            var fIx = nodesInOrder[i];
//                console.log('Ix to hit: ' fIx + );
            context.rf[fIx] = (fIx < totalIn ? context.rf[fIx] : functionsForNodes[fIx].call(context));
        }

        return context.rf.slice(totalIn, totalIn + outputCount);
    }
};

function runCPPNAcrossFixedSize(activationFunction, size)
{
    var inSqrt2 = Math.sqrt(2);

    var allX = size.width, allY = size.height;
    var width = size.width, height= size.height;

    var startX = -1, startY = -1;
    var dx = 2.0/(allX-1), dy = 2.0/(allY-1);

    var currentX = startX, currentY = startY;

    var newRow;
    var rows = [];

    var inputs = [];
    var outputs, rgb;


    //we go by the rows
    for(var y=allY-1; y >=0; y--){

        //init and push new row
        var newRow = [];
        rows.push(newRow);
        for(var x=0; x < allX; x++){

            //just like in picbreeder!
            var currentX = ((x << 1) - width + 1) / width;
            var currentY = ((y << 1) - height + 1) / height;

            inputs = [currentX, currentY, Math.sqrt(currentX*currentX + currentY*currentY)*inSqrt2];

            //run the CPPN please! Acyclic cppns only, thank you
            outputs = activationFunction(inputs);

            //rgb conversion here
            rgb = FloatToByte(PicHSBtoRGB(outputs[0], clampZeroOne(outputs[1]), Math.abs(outputs[2])));

            //add to list of outputs to return
            newRow.push(rgb);
        }
    }

    return rows;
}

function clampZeroOne(val)
{
    return Math.max(0.0, Math.min(val,1.0));
};
function FloatToByte(arr)
{
    var conv = [];

    arr.forEach(function(col)
    {
        conv.push(Math.floor(col*255.0));
    });

    return conv;
};

function PicHSBtoRGB(h,s,v)
{

    h = (h*6.0)%6.0;


    var r = 0.0, g = 0.0, b = 0.0;

    if(h < 0.0) h += 6.0;
    var hi = Math.floor(h);
    var f = h - hi;

    var vs = v * s;
    var vsf = vs * f;

    var p = v - vs;
    var q = v - vsf;
    var t = v - vs + vsf;

    switch(hi) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    return [r,g,b];
};