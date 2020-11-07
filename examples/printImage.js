const { Printer, Command } = require("../index");

let printer = new Printer();
let cmd = new Command();

!async function () {
    await cmd.image("./test-qrcode.png");
    cmd.newLine(2);
    await cmd.image("./test-image.png");
    cmd.newLine(5)
    .cut();
    await printer.write(cmd.export());
    printer.destroy();
}();