# escpos 指令打印机驱动

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
目前只针对佳博打80mm系列印机使用usb连接方式做了测试，确保使用佳博80mm热敏打印机能正常使用。
其它牌子的打印机没有做实测，不过理论上来说只要打印机支持escpos指令即可兼容，也有可能各家打印机在指令兼容上面各有微调。   
网络打印目前没有搞， 哪有鸡巴时间来搞。

## 测试效果
1.测试效果视频:   
 [https://www.bilibili.com/video/BV1Xo4y1d7pf/](https://www.bilibili.com/video/BV1Xo4y1d7pf/)   
2.测试效果图片：   
![图片加载失败](./doc/test.jpg)

## escpos 指令参考
[佳博打印机escpos指令手册.pdf](./doc/佳博票据打印机编程手册ESCv1.0.6.pdf)
