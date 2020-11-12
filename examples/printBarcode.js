const { Printer, Command } = require("../index");

let printer = new Printer();
let cmd = new Command();

!async function () {
    cmd.textCenter("条码打印测试(EAN-13)")
    .newLine(2)
    .barcode("1234567890123")
    .newLine(8)
    .cut();
    await printer.write(cmd.export());
    printer.destroy();
}();