
var base64 = require('./base64');

var generateBitmap = {};
module.exports = generateBitmap;

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

    if (!base64) {
        alert('Oops, base64 encode fail!!');
        return false;
    }

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


generateBitmap.CMYKtoRGB = function (c,m,y,k)
{
    var r = 1 - Math.min( 1, c * ( 1 - k ) + k );
    var g = 1 - Math.min( 1, m * ( 1 - k ) + k );
    var b = 1 - Math.min( 1, y * ( 1 - k ) + k );

    r = Math.round( r * 255 );
    g = Math.round( g * 255 );
    b = Math.round( b * 255 );

    return [r,g,b];
};

generateBitmap.HSVtoRGB = function(h,s,v) {
    //javascript from: http://jsres.blogspot.com/2008/01/convert-hsv-to-rgb-equivalent.html
    // Adapted from http://www.easyrgb.com/math.html
    // hsv values = 0 - 1, rgb values = 0 - 255
    var r, g, b;
    var RGB = [];
    if(s==0){
        var equalRGB = Math.round(v*255);
        RGB.push(equalRGB); RGB.push(equalRGB); RGB.push(equalRGB);
    }else{

        var var_r, var_g, var_b;
        // h must be < 1
        var var_h = h * 6;
        if (var_h==6) var_h = 0;
        //Or ... var_i = floor( var_h )
        var var_i = Math.floor( var_h );
        var var_1 = v*(1-s);
        var var_2 = v*(1-s*(var_h-var_i));
        var var_3 = v*(1-s*(1-(var_h-var_i)));
        if(var_i==0){
            var_r = v;
            var_g = var_3;
            var_b = var_1;
        }else if(var_i==1){
            var_r = var_2;
            var_g = v;
            var_b = var_1;
        }else if(var_i==2){
            var_r = var_1;
            var_g = v;
            var_b = var_3
        }else if(var_i==3){
            var_r = var_1;
            var_g = var_2;
            var_b = v;
        }else if (var_i==4){
            var_r = var_3;
            var_g = var_1;
            var_b = v;
        }else{
            var_r = v;
            var_g = var_1;
            var_b = var_2
        }
        //rgb results = 0 ÷ 255
        RGB.push(Math.round(var_r * 255));
        RGB.push(Math.round(var_g * 255));
        RGB.push(Math.round(var_b * 255));
    }
    return RGB;
};

var count = 0;

generateBitmap.FloatToByte = function(arr)
{
    var conv = [];

    arr.forEach(function(col)
    {
        conv.push(Math.floor(col*255.0));
    });

    return conv;
};

generateBitmap.PicHSBtoRGB = function(h,s,v)
{

    h = (h*6.0)%6.0;//Math.min(6.0, (h * 6.0));

//        if(++count % 2000 === 0)
//            console.log(h + ' and mod: ' + (h%6.0));

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