const iconv = require('iconv-lite');
const getPixels = require("get-pixels");
const qrimage = require("qr-image");

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
     * @param  {String|Buffer} bufOrPath 图片相对地址,或者buffer
     * @param  {String}        type      图片类型，bufOrPath 为Buffer类型时毕传
     * @return {Command}
     */
    async image (bufOrPath, type) {
        let { data, shape: [ width, height ] } = await new Promise((resolve, reject) => {
            if (Buffer.isBuffer(bufOrPath)) {
                getPixels(bufOrPath, type, (err, pixels) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(pixels);
                });
            } else {
                getPixels(bufOrPath, (err, pixels) => {
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(pixels);
                });
            }
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
            if (pixel.a === 0) {
                binary.push(0);
                continue;
            }
            const gray = parseInt((pixel.r + pixel.g + pixel.b) / 3);
            binary.push(gray > 170 ? 0 : 1); // 灰度小于2/3则判断为白色，反之为黑色
        }

        //生成打印机数据
        const bytes = [];
        const xCount = Math.ceil(width / 8);
        for (let n = 0; n < height; n++) {
            for (let x = 0; x < xCount; x++) {
                let byte = 0x00;
                for (let i = 0; i < 8; i++) {
                    if (binary[n * width + x * 8 + i]) {
                        byte |= 0x80 >> i;
                    }
                }
                bytes.push(byte);
            }
        }

        this._queue.push(...this._cmd["ESA"], 1);
        this._queue.push(...this._cmd["GSV0"], 0);
        this._queue.push(xCount & 0xff, (xCount >> 8) & 0xff, height & 0xff, (height >> 8) & 0xff, ...bytes);
        this._queue.push(...this._cmd["ESA"], 0);
        return this;
    }

    /**
     * 打打印二维码(二维码图片)
     * 
     * @param  {String} code 二维码要承载的信息
     * @param  {Number} size 二维码大小，建议5-15，实际可以自行测试取得合适的值
     * @return {Command}
     */
    async qrcode (code, size = 10) {
        const qrcodeBuf = qrimage.imageSync(code, { type: "png", size });
        await this.image(qrcodeBuf, "image/png");
        return this;
    }

    /**
     * 打印条码（EAN-13）
     * 
     * @param  {String} code 条码code,数字组成的字符串，长度必须为12-13
     * @return {Command}
     */
    barcode (code) {
        code = String(code);
        if (code.length > 13 || !/^[0-9]+$/.test(code)) throw "code长度不得大于13,且只能为数字！";
        this._queue.push(...this._cmd["ESA"], 1);
        this._queue.push(...this._cmd["GSH"], 2);
        this._queue.push(...this._cmd["GSK"], 2, ...Command.transformNumberToBarcode(code), 0x00);
        this._queue.push(...this._cmd["ESA"], 0);
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
    "GSV0": [0x1d, 0x76, 0x30], //GSV0 打印光栅位图
    "ESA":  [0x1b, 0x61], //设置水平对齐方式0,1,2 l，c，r
    "GSK":  [0x1d, 0x6b], //条码
    "GSH":  [0x1d, 0x48], //条码code位置
}
Command.transformNumberToBarcode = function (code) {
    const arr = code.split(""), result = [];
    arr.forEach(number => {
        result.push(Number(number) + 48);
    });
    return result;
}

module.exports = Command;