const { Printer, Command } = require("../index");

let printer = new Printer();
let cmd = new Command();

!async function () {
    const qrcode = "123456";
    await cmd.qrcode(qrcode);
    await printer.write(cmd.export());
    printer.destroy();
}();