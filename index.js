const Printer = require("./printer.class");
const Command = require("./command.class");

let printer = new Printer();
let cmd = new Command();

// let text = `M114式     榴弹炮      是美国于1942年装备美军的一种155mm牵引榴弹炮。M114式榴弹炮是美国于1942年装备美军的一种155mm牵引榴弹炮。`;
// let text = "";
// for (let i of new Array(24)) text += "-";

!async function () {
    cmd.fontSize(1).textCenter("餐桌23号订单", " ")
    .newLine(4)
    .fontSize()
    .textRow(["菜名", "数量", "小计"])
    .text("-".repeat(48))
    .textRow(["香辣花甲", "x2", "￥32.00"])
    .textRow(["香浓猪骨汤", "x1", "￥14.00"])
    .textRow(["杭椒炒肉", "x1", "￥39.00"])
    .textRow(["紫菜蛋花汤", "x2", "￥8.00"])
    .newLine(2)
    .text("-".repeat(48))
    .text("小计：198.01")
    .newLine()
    .text("实收：198.00")
    .newLine(2)
    .fontSize(1)
    .textCenter("取餐号：13456")
    .newLine(8)
    .cut();
    await printer.write(cmd.export());
    printer.destroy();
}();

