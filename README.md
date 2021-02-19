# escpos 指令打印机驱动

*仅仅自己研究测试使用，不成熟；因为自己也是遇到问题才更新；所以不建议使用这个库！*

## 介绍
适用于nodejs的小票打印机驱动。  
已在mac端、pc端、树莓派端(nodejs、nwjs) 下跑通。  

## 应用场景
nwjs/electron 驱动小票打印机打印菜单小票。   
nodejs 驱动打印机打印菜单小票。   

## 使用
直接看examples中的示例代码。  
或者看源码。  

## 注意
目前只针对佳博[(佳博官网)](http://cn.gainscha.com/default.php))80mm系列印机和广州优库打印模组[(模组官网简介)](http://www.chinayoko.com/index.php?m=Product&a=show&id=251)使用usb连接方式做了测试，确保能正常使用。
其它牌子的打印机没有做实测，不过理论上来说只要打印机支持escpos指令即可兼容，也有可能各家打印机在指令兼容上面各有微调。   
网络打印目前没有搞， 哪有鸡巴时间来搞。

## 测试效果
[80mm打印机测试视频](https://www.bilibili.com/video/BV1Xo4y1d7pf/)   
[58mm打印模组测试视频](https://www.bilibili.com/video/BV1uN411d7KU/)