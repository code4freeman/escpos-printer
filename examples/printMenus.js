const { Printer, Command } = require("../index");

let printer = new Printer();
let cmd = new Command();

!async function () {
    cmd.fontSize(1).textCenter("餐桌23号订单", " ")
    .newLine(4)
    .fontSize()
    .textRow(["菜名", "数量", "小计"])
    .text("_".repeat(48))
    .newLine(2)
    .textRow(["香辣花甲", "x2", "￥32.00"])
    .textRow(["香浓猪骨汤", "x1", "￥14.00"])
    .textRow(["杭椒炒肉", "x1", "￥39.00"])
    .textRow(["紫菜蛋花汤", "x2", "￥8.00"])
    .newLine(1)
    .text("_".repeat(48))
    .newLine(2)
    .text("小计：198.01")
    .newLine()
    .text("实收：198.00")
    .newLine(2)
    .fontSize(1)
    .textCenter("取餐号：13456")
    .newLine(5)
    .fontSize()
    .newLine(5)
    .cut();
    await printer.write(cmd.export());
    printer.destroy();
}();