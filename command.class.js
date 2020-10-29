const iconv = require('iconv-lite');

class Command {
    constructor () {
        this._cmd = Command.cmd;
        this._encoding = Command.encoding;
        this._width = Command.width;
        this._queue = [];
        this._init();
    }

    _init () {
        this._queue = [...this._cmd["GSP"], 22.5, 22.5];
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
    text (text = "") {
        this._queue.push(...iconv.encode(text, this._encoding), "\n");
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
     * 设置水平左右边距 
     * 
     * @param  {Number} ratio 0-0.25 宽度比例，1最宽，0最窄
     * @return {Command}
     */
    paddingH (ratio = 1) {
        if (ratio > 0.25) throw "ratio不得大于0.25！";
        let paddingLeft = ratio * this._width, width = this._width - (paddingLeft * 2);
        this._queue.push(...this._cmd["GSL"], paddingLeft, 0, ...this._cmd["GSW"], width, 0);
        return this;
    }

    /**
     * 设置左边距 
     * 
     * @param  {Number} ratio 0-1
     * @return {Command}
     */
    paddingL (ratio = 1) {
        let paddingLeft = ratio * this._width, width = this._width - paddingLeft;
        this._queue.push(...this._cmd["GSL"], paddingLeft, 0, ...this._cmd["GSW"], width, 0);
        return this;
    }

    /**
     * 设置右边距 
     * 
     * @param  {Number} ratio
     * @return {Command}
     */
    paddingR (ratio = 1) {
        let width = this._width - (this._width * ratio);
        this._queue.push(...this._cmd["GSL"], 0, 0, ...this._cmd["GSW"], width, 0);
        return this;
    }


}
Command.encoding = "GB18030";
Command.width = 70;
Command.cmd = {
    "GSL":  [0x1d, 0x4c], //打印左边距
    "ESCD": [0x1b, 0x64], //打印并走纸n行
    "GSW":  [0x1d, 0x57], //设置打印区域宽度
    "GSP":  [0x1d, 0x50], //设置横向、纵向移动单位22.5为1mm,此命令时候在机器重启前都有效
    "GS!":  [0x1d, 0x21], //设置字符大小
    "ESCB": [0x1b, 0x42], //蜂鸣器
    "GSV":  [0x1d, 0x56], //切纸
}

module.exports = Command;