const Printer = require("./printer.class");
const Command = require("./command.class");

let printer = new Printer();
let cmd = new Command();

let text = `M114式榴弹炮是美国于1942年装备美军的一种155mm牵引榴弹炮。M114式榴弹炮是美国于1942年装备美军的一种155mm牵引榴弹炮。`;
// let text = "1234567890";

!async function () {
    cmd.paddingH(0.05).text(text).newLine(8).cut();
    await printer.write(cmd.export());
    printer.destroy();
}();
