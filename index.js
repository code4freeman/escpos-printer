const iconv = require('iconv-lite');
const Printer = require("./printer.class");

let printer = new Printer();

let text = `
M114式榴弹炮是美国于1942年装备美军的一种155mm牵引榴弹炮。该型榴弹炮由炮身、反后坐装置和炮架等部分组成。M114式榴弹炮战斗全重5.761吨，发射榴弹时最大初速563.9米/秒，最大射程14.6公里，最大射速6发/分钟，可发射多种常规弹药和核弹。
`;
const buf = Buffer.from([...iconv.encode(text, "gb18030").values()]);

!async function () {
    for (let i of new Array(10)) {
        await printer.write(buf);
    }
    printer.destroy();

    printer.write(buf);
}();
