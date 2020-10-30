const iconv = require('iconv-lite');

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
        const chineseCharREG = /[\u4e00-\u9fa5]/;
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

    fontSize (size = 1) {
        // 0-2位代表高度，4-6位代表宽度；0-7
        if (size > 7) throw "size不得大于8！";
        this._state.fontSize = size;
        const v = ((size << 4) ^ size);
        this._queue.push(...this._cmd["GS!"], v);
        return this;
    }

    blob (is = false) {
        this._queue.push(...this._cmd["ESCE"], is ? 1 : 0);
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
}

module.exports = Command;