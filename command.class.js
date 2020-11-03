const iconv = require('iconv-lite');
const getPixels = require("get-pixels");
const fs = require("fs");

class Command {
    constructor () {
        this._cmd = Command.cmd;
        this._encoding = Command.encoding;
        this._textLength = Command.textLength;
        this._queue = [];
        this._state = {};
        this._init();
    }

    _init () {
        this._queue = [...this._cmd["GSP"], 22.5, 22.5];
        this._state = {
            fontSize: 0,
        }
    }

    _computeTextLength (text) {
        const chineseCharREG = /[^\x00-\xff]/;
        let length = 0;
        for (let i of text) {
            if (chineseCharREG.test(i)) length += 2;
            else length += 1;
        }
        return length;
    }

    /**
     * 导出命令 
     */
    export () {
        if (this._queue.length === 0) throw "没有命令，无法导出！";
        const buf = Buffer.from(this._queue);
        this._init();
        return buf;
    }

    /**
     * 蜂鸣器 
     * 
     * @param  {Number} count 蜂鸣器名叫次数，1-9
     * @param  {Number} time  蜂鸣器响一声的时间毫秒
     * @return {Command}
     */
    buzzer (count = 1, time = 100) {
        this._queue.push(...this._cmd["ESCB"], count, 100 / 50);
        return this;
    }

    /**
     * 切纸
     * 
     * @return {Command}
     */
    cut () {
        this._queue.push(...this._cmd["GSV"], 1);
        return this;
    }

    /**
     * 写入文字 
     * 
     * @param  {String} text
     * @return {Command}
     */
    text (text = "", ) {
        this._queue.push(...iconv.encode(text, this._encoding));
        return this;
    }

    /**
     * 单行居中文本
     * 
     * @param  {String} text 文字
     * @param  {String} replace 替换文字，替换空白部分
     * @return {Command}
     */
    textCenter (text = "", replace = " ") {
        let 
        length = this._textLength / (this._state.fontSize + 1),
        textLength = this._computeTextLength(text),
        LRWidth = (length - textLength) / 2;
        console.log(length)
        this._queue.push(...iconv.encode(replace.repeat(LRWidth) + text + replace.repeat(LRWidth), this._encoding));
        return this;
    }

    /**
     * 字符行，水平分割显示输入的文本集合
     * 
     * @param  {Array<String>} texts 文本集合
     * @return {Command}
     */
    textRow (texts = []) {
        let 
        length = this._textLength / (this._state.fontSize + 1),
        cellLength = length / texts.length,
        text = "";
        for (let i of texts) {
            let iLength = this._computeTextLength(i), spacLength = cellLength - iLength;
            text += i + " ".repeat(spacLength);
        }
        console.log(text)
        this._queue.push(...iconv.encode(text, this._encoding));
        return this;
    }

    /**
     * 走纸n行
     * 
     * @param  {Number} 0-255 走纸行数
     * @return {Command}
     */
    newLine (num = 1) {
        this._queue.push(...this._cmd["ESCD"], num);
        return this;
    }

    /**
     * 设置行间距
     * 
     * @param  {Number} height 0-255 单位毫米，不传递就设置为默认行间距
     * @return {Command}
     */
    lineHeight (height) {
        if (height === undefined) {
            this._queue.push(...this._cmd["ESC2"]); //指令文档上说默认值就是3.75mm
        } else {
            this._queue.push(...this._cmd["ESC3"], height);
        }
        return this;
    }

    /**
     * 设置字体大小
     * 
     * @param  {Number} size 0-7 缺省为默认大小
     * @return {Command}
     */
    fontSize (size = 0) {
        // 0-2位代表高度，4-6位代表宽度；0-7
        if (size > 7) throw "size不得大于8！";
        this._state.fontSize = size;
        const v = ((size << 4) ^ size);
        this._queue.push(...this._cmd["GS!"], v);
        return this;
    }

    /**
     * 字体加粗、取消加粗
     * 
     * @param  {Boolean} is 是否加粗，缺省为false
     * @return {Command}
     */
    blob (is = false) {
        this._queue.push(...this._cmd["ESCE"], is ? 1 : 0);
        return this;
    }

    /**
     * 打印图片 GSV0
     * 
     * @param  {String} imgPath 图片相对地址
     * @return {Command}
     */
    async image (imgPath = "") {
        let { data, shape: [ width, height ] } = await new Promise((resolve, reject) => {
            getPixels(imgPath, (err, pixels) => {
                if(err) {
                    reject(err);
                    return;
                }
                console.log("获取像素完毕！");
                fs.writeFileSync("out.json", JSON.stringify(pixels, null, 4));
                resolve(pixels);
            });
        });
        const pixels = [];
        Object.keys(data).forEach(k => pixels.push(data[k]));

        //转黑白
        const binary = [];
        for (let i = 0; i < pixels.length; i += 4) {
            const pixel = {
                r: pixels[i],
                g: pixels[i + 1],
                b: pixels[i + 2],
                a: pixels[i + 3]
            }
            if (pixel.a <= 127.5) {
                binary.push(0);
                continue;
            }
            const gray = parseInt((pixel.r + pixel.g + pixel.b) / 3);
            binary.push(gray > 127.5 ? 1 : 0);
        }
        fs.writeFileSync("check.json", JSON.stringify(binary, null, 4));

        //生成二进制
        const bytes = [];
        for (let i = 0; i < binary.length; i += 8) {
            let byte = 0x00;
            for (let j = 0; j < 8; j++) {
                if (binary[i * 8 + j]) {
                    byte |= 0x80 >> j;
                }
            }
            bytes.push(byte);
        }

        throw "!stop";

        this._queue.push(...this._cmd["GSV0"], 0, (width >> 3) & 0xff, 0, height & 0xff, (height >> 8) & 0xff, ...bytes);
        return this;
    }

}
Command.encoding = "GB18030";
Command.textLength = 48;
Command.cmd = {
    "GSL":  [0x1d, 0x4c], //打印左边距
    "ESCD": [0x1b, 0x64], //打印并走纸n行
    "GSW":  [0x1d, 0x57], //设置打印区域宽度
    "GSP":  [0x1d, 0x50], //设置横向、纵向移动单位22.5为1mm,此命令时候在机器重启前都有效
    "GS!":  [0x1d, 0x21], //设置字符大小
    "ESCB": [0x1b, 0x42], //蜂鸣器
    "GSV":  [0x1d, 0x56], //切纸
    "ESC3": [0x1b, 0x33], //设置行间距
    "ESC2": [0x1b, 0x32], //选择默认行间距
    "ESCE": [0x1b, 0x45], //是否加粗
    "GSV0": [0x1d, 0x76, 0x30] //GSV0 打印光栅位图
}

module.exports = Command;