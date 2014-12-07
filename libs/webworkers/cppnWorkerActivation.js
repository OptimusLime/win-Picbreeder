
var self = this;
var base64 = {};
var generateBitmap = {};

onmessage = function(e){

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

		//cppn outputs to RGB Bitmap -- huzzah!
		var fileOutput = generateBitmap.generateBitmapDataURL(cppnOutputs);

		//send back our data, we'll have to loop through it and convert to bytes, but this is the raw data
		postMessage({wid: wid, dataURL: fileOutput, width: funData.width, height: funData.height});
	}
	catch(e)
	{
		 // Send back the error to the parent page
  		postMessage({error: e.message, stack: e.stack});
	}
};


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


//base64 stuff
//from:
//https://code.google.com/p/stringencoders/source/browse/trunk/javascript/base64.js?r=230


/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/* base64 encode/decode compatible with window.btoa/atob
 *
 * window.atob/btoa is a Firefox extension to convert binary data (the "b")
 * to base64 (ascii, the "a").
 *
 * It is also found in Safari and Chrome.  It is not available in IE.
 *
 * if (!window.btoa) window.btoa = base64.encode
 * if (!window.atob) window.atob = base64.decode
 *
 * The original spec's for atob/btoa are a bit lacking
 * https://developer.mozilla.org/en/DOM/window.atob
 * https://developer.mozilla.org/en/DOM/window.btoa
 *
 * window.btoa and base64.encode takes a string where charCodeAt is [0,255]
 * If any character is not [0,255], then an DOMException(5) is thrown.
 *
 * window.atob and base64.decode take a base64-encoded string
 * If the input length is not a multiple of 4, or contains invalid characters
 *   then an DOMException(5) is thrown.
 */

base64.PADCHAR = '=';
base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

base64.makeDOMException = function() {
    // sadly in FF,Safari,Chrome you can't make a DOMException
    var e, tmp;

    try {
        return new DOMException(DOMException.INVALID_CHARACTER_ERR);
    } catch (tmp) {
        // not available, just passback a duck-typed equiv
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
        var ex = new Error("DOM Exception 5");

        // ex.number and ex.description is IE-specific.
        ex.code = ex.number = 5;
        ex.name = ex.description = "INVALID_CHARACTER_ERR";

        // Safari/Chrome output format
        ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
        return ex;
    }
};

base64.getbyte64 = function(s,i) {
    // This is oddly fast, except on Chrome/V8.
    //  Minimal or no improvement in performance by using a
    //   object with properties mapping chars to value (eg. 'A': 0)
    var idx = base64.ALPHA.indexOf(s.charAt(i));
    if (idx === -1) {
        throw base64.makeDOMException();
    }
    return idx;
};

base64.decode = function(s) {
    // convert to string
    s = '' + s;
    var getbyte64 = base64.getbyte64;
    var pads, i, b10;
    var imax = s.length;
    if (imax === 0) {
        return s;
    }

    if (imax % 4 !== 0) {
        throw base64.makeDOMException();
    }

    pads = 0
    if (s.charAt(imax - 1) === base64.PADCHAR) {
        pads = 1;
        if (s.charAt(imax - 2) === base64.PADCHAR) {
            pads = 2;
        }
        // either way, we want to ignore this last block
        imax -= 4;
    }

    var x = [];
    for (i = 0; i < imax; i += 4) {
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
            (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
    }

    switch (pads) {
        case 1:
            b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
            break;
        case 2:
            b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
            x.push(String.fromCharCode(b10 >> 16));
            break;
    }
    return x.join('');
};

base64.getbyte = function(s,i) {
    var x = s.charCodeAt(i);
    if (x > 255) {
        throw base64.makeDOMException();
    }
    return x;
};

base64.encode = function(s) {
    if (arguments.length !== 1) {
        throw new SyntaxError("Not enough arguments");
    }
    var padchar = base64.PADCHAR;
    var alpha   = base64.ALPHA;
    var getbyte = base64.getbyte;

    var i, b10;
    var x = [];

    // convert to string
    s = '' + s;

    var imax = s.length - s.length % 3;

    if (s.length === 0) {
        return s;
    }
    for (i = 0; i < imax; i += 3) {
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
        x.push(alpha.charAt(b10 >> 18));
        x.push(alpha.charAt((b10 >> 12) & 0x3F));
        x.push(alpha.charAt((b10 >> 6) & 0x3f));
        x.push(alpha.charAt(b10 & 0x3f));
    }
    switch (s.length - imax) {
        case 1:
            b10 = getbyte(s,i) << 16;
            x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                padchar + padchar);
            break;
        case 2:
            b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
            x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
                alpha.charAt((b10 >> 6) & 0x3f) + padchar);
            break;
    }
    return x.join('');
};

//Generate bitmap stuff
/*
* Code to generate Bitmap images (using data urls) from rows of RGB arrays.
* Specifically for use with http://mrcoles.com/low-rest-paint/
*
* Research:
*
* RFC 2397 data URL
* http://www.xs4all.nl/~wrb/Articles/Article_IMG_RFC2397_P1_01.htm
*
* BMP file Format
* http://en.wikipedia.org/wiki/BMP_file_format#Example_of_a_2.C3.972_Pixel.2C_24-Bit_Bitmap_.28Windows_V3_DIB.29
*
* BMP Notes
*
* - Integer values are little-endian, including RGB pixels, e.g., (255, 0, 0) -> \x00\x00\xFF
* - Bitmap data starts at lower left (and reads across rows)
* - In the BMP data, padding bytes are inserted in order to keep the lines of data in multiples of four,
*   e.g., a 24-bit bitmap with width 1 would have 3 bytes of data per row (R, G, B) + 1 byte of padding
*/

function _asLittleEndianHex(value, bytes) {
    // Convert value into little endian hex bytes
    // value - the number as a decimal integer (representing bytes)
    // bytes - the number of bytes that this value takes up in a string

    // Example:
    // _asLittleEndianHex(2835, 4)
    // > '\x13\x0b\x00\x00'

    var result = [];

    for (; bytes>0; bytes--) {
        result.push(String.fromCharCode(value & 255));
        value >>= 8;
    }

    return result.join('');
}

function _collapseData(rows, row_padding) {
    // Convert rows of RGB arrays into BMP data
    var i,
        rows_len = rows.length,
        j,
        pixels_len = rows_len ? rows[0].length : 0,
        pixel,
        padding = '',
        result = [];

    for (; row_padding > 0; row_padding--) {
        padding += '\x00';
    }

    for (i=0; i<rows_len; i++) {
        for (j=0; j<pixels_len; j++) {
            pixel = rows[i][j];
            result.push(String.fromCharCode(pixel[2]) +
                String.fromCharCode(pixel[1]) +
                String.fromCharCode(pixel[0]));
        }
        result.push(padding);
    }

    return result.join('');
}

function _scaleRows(rows, scale) {
    // Simplest scaling possible
    var real_w = rows.length,
        scaled_w = parseInt(real_w * scale),
        real_h = real_w ? rows[0].length : 0,
        scaled_h = parseInt(real_h * scale),
        new_rows = [],
        new_row, x, y;

    for (y=0; y<scaled_h; y++) {
        new_rows.push(new_row = []);
        for (x=0; x<scaled_w; x++) {
            new_row.push(rows[parseInt(y/scale)][parseInt(x/scale)]);
        }
    }
    return new_rows;
}

//generate bitmaps from rows of rgb values
//from: http://mrcoles.com/low-res-paint/
//and: http://mrcoles.com/blog/making-images-byte-by-byte-javascript/
generateBitmap.generateBitmapDataURL = function(rows, scale) {
    // Expects rows starting in bottom left
    // formatted like this: [[[255, 0, 0], [255, 255, 0], ...], ...]
    // which represents: [[red, yellow, ...], ...]
    scale = scale || 1;
    if (scale != 1) {
        rows = _scaleRows(rows, scale);
    }

    var height = rows.length,                                // the number of rows
        width = height ? rows[0].length : 0,                 // the number of columns per row
        row_padding = (4 - (width * 3) % 4) % 4,             // pad each row to a multiple of 4 bytes
        num_data_bytes = (width * 3 + row_padding) * height, // size in bytes of BMP data
        num_file_bytes = 54 + num_data_bytes,                // full header size (offset) + size of data
        file;

    height = _asLittleEndianHex(height, 4);
    width = _asLittleEndianHex(width, 4);
    num_data_bytes = _asLittleEndianHex(num_data_bytes, 4);
    num_file_bytes = _asLittleEndianHex(num_file_bytes, 4);

    // these are the actual bytes of the file...

    file = ('BM' +               // "Magic Number"
        num_file_bytes +     // size of the file (bytes)*
        '\x00\x00' +         // reserved
        '\x00\x00' +         // reserved
        '\x36\x00\x00\x00' + // offset of where BMP data lives (54 bytes)
        '\x28\x00\x00\x00' + // number of remaining bytes in header from here (40 bytes)
        width +              // the width of the bitmap in pixels*
        height +             // the height of the bitmap in pixels*
        '\x01\x00' +         // the number of color planes (1)
        '\x18\x00' +         // 24 bits / pixel
        '\x00\x00\x00\x00' + // No compression (0)
        num_data_bytes +     // size of the BMP data (bytes)*
        '\x13\x0B\x00\x00' + // 2835 pixels/meter - horizontal resolution
        '\x13\x0B\x00\x00' + // 2835 pixels/meter - the vertical resolution
        '\x00\x00\x00\x00' + // Number of colors in the palette (keep 0 for 24-bit)
        '\x00\x00\x00\x00' + // 0 important colors (means all colors are important)
        _collapseData(rows, row_padding)
        );

    return 'data:image/bmp;base64,' + base64.encode(file);
};