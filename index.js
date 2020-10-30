const Printer = require("./printer.class");
const Command = require("./command.class");

let printer = new Printer();
let cmd = new Command();

// let text = `M114式     榴弹炮      是美国于1942年装备美军的一种155mm牵引榴弹炮。M114式榴弹炮是美国于1942年装备美军的一种155mm牵引榴弹炮。`;
// let text = "";
// for (let i of new Array(24)) text += "-";

!async function () {
    cmd.fontSize(1).textCenter("餐桌23号订单", " ").newLine(3).fontSize(1).text(("-").repeat(24)).fontSize(0).newLine(1).blob(true).text("您的取餐号为：")
    .fontSize(1).text("123456").fontSize(0)
    .newLine().blob().text("您前面排队：5人")
    .newLine(8).cut();
    await printer.write(cmd.export());
    printer.destroy();
}();

