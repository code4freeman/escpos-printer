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
 * 摘抄自escpos 
 */
function toBitmap (pixsls = [],  density = 24, height, width) {
	const 
	result = [],
	lineNum = pixsls.length / density;
	//每行循环
	for (let line = 0; i < lineNum; line++) {
		const lineData = result[line] = [];
		//每列循环
		for (let w = 0; w < width; w++) {
			for (let b = 0; b < density; b++) {
				let i = w * (density / 8) + (b >> 3);
				if (lineData[i] === undefined) {
					lineData[i] = 0;
				}
				let nowLine = line * density + b;
				if (nowLine < height) {
					if (this.data[nowLine * width + w]) {
						lineData[i] += (0x80 >> (b & 0x7));
					}
				}
			}
		}
	}
	return {
		data: result,
		density
	}
}


