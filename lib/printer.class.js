const usb = require("usb");
const printType = 0x07;

class Printer {
    constructor (vid, pid) {
        this._printer = Printer.findPrint(vid, pid);
        this._interfaceOfEp = null;
        this._ep = this._getEndpoint();
    }

    _getEndpoint () {
        this._printer.open();
        for (let itf of [...this._printer.interfaces]) {
            if (itf.isKernelDriverActive()) {
                itf.attachKernelDriver();
            }
            itf.claim();
            for (let endpoint of itf.endpoints) {
                if (endpoint.direction === "out") {
                    this._interfaceOfEp = itf;
                    return endpoint;
                }
            }
        }
        throw "没有找到打印机写数据的端点！";
    }

    /**
     * 向打印机写入数据 
     * 
     * @param {Buffer} data buffer数据
     */
    async write (data) {
        return new Promise((resolve, reject) => {
            this._ep.transfer(data, err => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    /**
     * 销毁打印机 
     */
    async destroy () {
        await new Promise((resolve , reject) => {
            this._interfaceOfEp.release(this._ep, err => err ? reject(err) : resolve());
        });
        this._printer.close();
    }
}

/**
 * 查找打印机
 * 
 * @return {Array} 
 */
Printer.findPrints = function () {
    const dvs = usb.getDeviceList();
    const prints = dvs.filter(dv => {
        if (dv.configDescriptor) {
            return dv.configDescriptor.interfaces.filter(arr => {
                return ([...arr]).filter(interface => {
                    return interface.bInterfaceClass === printType;
                }).length;
            }).length;
        }
    });
    return prints;
}

/**
 *  查找指定打印机，没有指定vip或pid则返回第一个
 * 
 * @param  {String} vid 打印机vid, 可选
 * @param  {String} pid 打印机pid, 可选
 * @return {Array}  打印机数组
 */
Printer.findPrint = function (vid, pid) {
    let prints = module.exports.findPrints();
    if (prints.length === 0) throw "没有找到任何打印机！";
    if (!vid && !pid) {
        return prints[0];
    }
    if (vid !== undefined) {
        prints = prints.filter(p => p.deviceDescriptor.idVendor === vid);
    }
    if (pid !== undefined) {
        prints = prints.filter(p => p.deviceDescriptor.idProduct === pid);
    }
    return prints;
}

module.exports = Printer;