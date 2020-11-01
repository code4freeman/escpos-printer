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
  
    // 图片高度除以密度的出行
    var n = Math.ceil(this.size.height / density);

    //循环每行
    for (y = 0; y < n; y++) {

      // 每行的数据集合
      ld = result[y] = [];
      
      //循环每行的列
      for (x = 0; x < this.size.width; x++) {
        
        //使用密度在列循环中取数据
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
  
    // 3
    printImageBuffer(width, height, data) {
      this.buffer = null;
  
      // Get pixel rgba in 2D array
      var pixels = [];
      for (var i = 0; i < height; i++) {
        var line = [];
        for (var j = 0; j < width; j++) {
          var idx = (width * i + j) << 2;
          line.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3]
          });
        }
        pixels.push(line);
      }
  
  
      var imageBuffer_array = [];
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < Math.ceil(width / 8); j++) {
          var byte = 0x0;
          for (var k = 0; k < 8; k++) {
            var pixel = pixels[i][j * 8 + k];
  
            // Image overflow
            if (pixel === undefined) {
              pixel = {
                a: 0,
                r: 0,
                g: 0,
                b: 0
              };
            }
  
            if (pixel.a > 126) { // checking transparency
              var grayscale = parseInt(0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b);
  
              if (grayscale < 128) { // checking color
                var mask = 1 << 7 - k; // setting bitwise mask
                byte |= mask; // setting the correct bit to 1
              }
            }
          }
  
          imageBuffer_array.push(byte);
          // imageBuffer = Buffer.concat([imageBuffer, Buffer.from([byte])]);
        }
      }
  
      let imageBuffer = Buffer.from(imageBuffer_array);
  
      // Print raster bit image
      // GS v 0
      // 1D 76 30	m	xL xH	yL yH d1...dk
      // xL = (this.width >> 3) & 0xff;
      // xH = 0x00;
      // yL = this.height & 0xff;
      // yH = (this.height >> 8) & 0xff;
      // https://reference.epson-biz.com/modules/ref_escpos/index.php?content_id=94
  
      // Check if width/8 is decimal
      if (width % 8 != 0) {
        width += 8;
      }
  
      this.append(Buffer.from([0x1d, 0x76, 0x30, 48]));
      this.append(Buffer.from([(width >> 3) & 0xff]));
      this.append(Buffer.from([0x00]));
      this.append(Buffer.from([height & 0xff]));
      this.append(Buffer.from([(height >> 8) & 0xff]));
  
      // append data
      this.append(imageBuffer);
  
      return this.buffer;
    }