declare module "escpos-printer" {

    /**
     * escpos命令类
     * 用于构建操作escpos数据
     */
    export class Command {
        constructor (options: { printWidth: "58mm"|"80mm" });

        // 导出escpos命令字节流
        public export (): Buffer;

        // 蜂鸣器
        public buzzer (
            // 鸣叫次数，建议1-9
            count: number, 
            // 鸣叫每一次的时长ms
            time: number
        ): Command;

        // 切纸
        // 我实测在具有切纸功能的打印机上有效
        public cut (): Command;

        // 写文本
        public text (text: string): Command;

        // 写文本（左右居中）
        // 建议文字较短的标题
        public textCenter (text: string): Command;

        // 表格文本，如购物单的产品列表行
        // 格式如：
        // [
        //    ["标题",   "单价", "结算价"],
        //    ["辣条",   18,     18     ],
        //    ["方便面", 19,     19     ]
        // ]
        public textRow (texts: Array<Array<string>>): Command;

        // 走纸
        public newLine (num: number): Command;

        // 设置行高
        public lineHeight (height: number): Command;

        // 设置字体大小
        public fontSize (size: number): Command;

        // 字体加粗/取消加粗
        public blob (is: Boolean): Command;

        // 打印图片
        public image (bufOrPath: string|Buffer): Promise<Command>;

        // 打印二维码
        public qrcode (
            code: string, 
            // size 范围5-15, 默认为10
            size: number
        ): Promise<Command>;

        // 打印条码
        public barcode (code: string): Command;
    }

    export namespace Command {
        export const printeWidths: { [key: string]: number };
        export const encoding: "GB18030"|number;
        export const cmd: { [key: string]: Array<number> };
        export function transformNumberToBarcode (code: string): Array<number>;
    }

    /**
     * 打印机硬件设备 
     */
    export interface PrinterDevice {
        open: () => void;
        close: () => void;
        // interfaces 由usb库返回
        // 因此可能存在usb库更新导致数据额结构变动
        // 所以这里用any代替
        interfaces: Array<any>;
        // more ...
        [key: string]: any;
    }

    /**
     * 打印机类
     * 与打印机通信 
     */
    export class Printer {
        constructor (vid?: string, pid?: string);

        // 向打印机写入数据
        public write (data: Buffer): Promise<void>;

        // 销毁打印机
        public destroy (): Promise<void>;
    }

    export namespace Printer {
        // 查找所有打印机硬件设备
        export function findPrints (): Array<PrinterDevice>;

        // 查找指定vid,pid的打印机设备
        // 不指定pid或者vid， 则返回所有打印机列表中的第一个
        export function findPrint (vid?: string, pid?: string): PrinterDevice;
    }
}