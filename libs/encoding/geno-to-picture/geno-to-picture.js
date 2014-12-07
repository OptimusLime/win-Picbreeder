//here we test the insert functions
//making sure the database is filled with objects of the schema type
// var wMath = require('win-utils').math;

module.exports = genoToPicture;

var cppnjs = require('cppnjs');
//need to add the pure cppn functions -- for enclosure stuff
cppnjs.addPureCPPN();

var neatjs = require('neatjs');
var winneat = require('win-neat');

var generateBitmap = require('./generateBitmap.js');

function genoToPicture(size, ngJSON)
{ 
    var ngObject = winneat.genotypeFromJSON(ngJSON);

    //then we are going to do this crazy thing where we grab the function representing the genome
    //then we run the function a bunch of times looping over our image, compiling the data
    //that data is then turned into a string which is sent to the dataurl object of a picture

    return createImageFromGenome(size, ngObject);
}

function createImageFromGenome(size, ng)
{
    var cppn = ng.networkDecode();

    // console.log('Decoded now recrusive processing!');
    // console.log(ng);

    var dt = Date.now();

    console.log(cppn);

    var functionObject = cppn.createPureCPPNFunctions();
    console.log("Pure cppn: ", functionObject);
    var activationFunction= functionObject.contained;


    var inSqrt2 = Math.sqrt(2);

    var allX = size.width, allY = size.height;
    var width = size.width, height= size.height;

    var startX = -1, startY = -1;
    var dx = 2.0/(allX-1), dy = 2.0/(allY-1);

    var currentX = startX, currentY = startY;

    var newRow;
    var rows = [];

    var clampZeroOne = function(val)
    {
        return Math.max(0.0, Math.min(val,1.0));
    };
    // 0 to 1
    var zeroToOne = function(val) {
        return (val+1)/2;//Math.floor(Math.max(0, Math.min(255, (val + 1)/2*255)));
    };

    var inRange = function(val) {
        if(val < 0) return (val+1);

        return val;//Math.floor(Math.max(0, Math.min(255, (val + 1)/2*255)));
    };


    var oCount = 0;
    var inputs = [];

    //we go by the rows
    for(var y=allY-1; y >=0; y--){

        //init and push new row
        var newRow = [];
        rows.push(newRow);
        for(var x=0; x < allX; x++){

            //just like in picbreeder!
            var currentX = ((x << 1) - width + 1) / width;
            var currentY = ((y << 1) - height + 1) / height;


            var output0, output1, output2;
            var rgb;

            inputs = [currentX, currentY, Math.sqrt(currentX*currentX + currentY*currentY)*inSqrt2];

            var newActivation = true;
            var outputs;

            outputs = activationFunction(inputs);

            if(outputs.length ==1 || ng.phenotype == 'structure')
            {
                var singleOutput = ng.phenotype == 'structure' ? outputs[2] : outputs[0];
                var byte = Math.floor(Math.min(Math.abs(singleOutput), 1.0)*255.0);
                //var byte = Math.floor(Math.max(0.0, Math.min(1.0, output0))*255.0);

                rgb= [byte,byte,byte];//generateBitmap.HSVtoRGB(zeroToOne(output0), zeroToOne(output0), zeroToOne(output0));

            }
            else
            {
                rgb = generateBitmap.FloatToByte(generateBitmap.PicHSBtoRGB(outputs[0], clampZeroOne(outputs[1]), Math.abs(outputs[2])));
            }

            newRow.push(rgb);

        }

    }


    //let's get our bitmap from rbg results!
    var imgSrc = generateBitmap.generateBitmapDataURL(rows);

    console.log("Gen time: ", (Date.now() - dt));

    return imgSrc;
}