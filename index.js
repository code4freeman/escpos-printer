const Printer = require("./printer.class");
const Command = require("./1");

let printer = new Printer();
let cmd = new Command();

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
    .newLine(5)
    .fontSize()
    .textCenter("扫码领取积分")
    .newLine();
    await cmd.image("./test1.png")
    cmd.newLine(8)
    .cut();
    await printer.write(cmd.export());
    printer.destroy();
}();

// GSV0 打印测试
// !async function () {
//     await cmd.image("./test.png");
//     cmd.newLine(8);
//     await printer.write(cmd.export());
//     printer.destroy();
// }();