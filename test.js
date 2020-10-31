// var getPixels = require("get-pixels")
// const fs = require("fs");
 
// getPixels("./test.png", function(err, pixels) {
//   if(err) {
//     console.log("err")
//     return
//   }
//   console.log("got pixels", pixels)
//   fs.writeFileSync("out.json", JSON.stringify(pixels, null, 4));
// })

/**
 * [image description]
 * @param  {[type]} image   [description]
 * @param  {[type]} density [description]
 * @return {[Printer]} printer  [the escpos printer instance]
 */
Printer.prototype.image = async function (image, density) {
    if (!(image instanceof Image))
      throw new TypeError('Only escpos.Image supported');
    density = density || 'd24';
    var n = !!~['d8', 's8'].indexOf(density) ? 1 : 3;
    var header = _.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];
    var bitmap = image.toBitmap(n * 8);
    var self = this;
  
    // added a delay so the printer can process the graphical data
    // when connected via slower connection ( e.g.: Serial)
    this.lineSpace(0); // set line spacing to 0
    bitmap.data.forEach(async (line) => {
      self.buffer.write(header);
      self.buffer.writeUInt16LE(line.length / n);
      self.buffer.write(line);
      self.buffer.write(_.EOL);
      await new Promise((resolve, reject) => {
        setTimeout(() => { resolve(true) }, 200);
      });
    });
    return this.lineSpace();
  };
  

  /**
 * [toBitmap description]
 * @param  {[type]} density [description]
 * @return {[type]}         [description]
 */
Image.prototype.toBitmap = function(density) {
    density = density || 24;
  
    var ld, result = [];
    var x, y, b, l, i;
    var c = density / 8;
  
    // n blocks of lines
    var n = Math.ceil(this.size.height / density);
  
    for (y = 0; y < n; y++) {
      // line data
      ld = result[y] = [];
  
      for (x = 0; x < this.size.width; x++) {
  
        for (b = 0; b < density; b++) {
          i = x * c + (b >> 3);
  
          if (ld[i] === undefined) {
            ld[i] = 0;
          }
  
          l = y * density + b;
          if (l < this.size.height) {
            if (this.data[l * this.size.width + x]) {
              ld[i] += (0x80 >> (b & 0x7));
            }
          }
        }
      }
    }
  