const { Printer, Command } = require("../index");

const print = new Printer();
const cmd = new Command({ printeWidth: "58mm" });

!async function () {

    cmd.fontSize(1)
    .textCenter("菜单打印测试")
    .fontSize()
    .newLine(2)
    .textRow(["名称", "数量", "价格"])
    .text("=".repeat(32))
    cmd.textRow(["重庆有友酸菜味泡椒凤爪(250g)", "x2", "18.00"])
    .textRow(["乐视黄瓜味薯片", "x1", "8.00"])
    .textRow(["有友泡椒猪皮(250g)", "x3", "22.50"])
    .textRow(["橙汁", "x1", "15.50"])
    .textRow(["环保降解袋(小号)", "x1", "0.60"])
    .text("=".repeat(32))
    .text("总计：77.30元")
    .newLine(2)
    .fontSize(1)
    .textCenter("谢谢光临")
    .newLine(2);

    await print.write(cmd.export());
    console.log("打印完毕！");
}();