# watermark.js

watermark.js 是一个用于给图片嵌入盲水印的前端库。解水印不需要原图。

可嵌入水印类型分别为：布尔值数组、字符串、图片。

水印具有一定的抗攻击能力，比如马赛克、水平裁剪。当前版本垂直剪裁会破坏原图。

## 安装
```js
npm install --save  watermark.js
```


## 使用

```js
import watermark from 'watermark.js'
```

### 嵌入水印

```js
1. 布尔数组
watermark.addWm({originImg: imgDom, wm:[true, true, false, false] , wmType: 'bool'}).then(val => val.wmLength)

2. 字符串
watermark.addWm({originImg: imgDom, wm: '测试数据噢', wmType: 'string'}).then(val => val.wmLength)

3. 图片水印
watermark.addWm({originImg: imgDom, wm: waterMarkImgDom, wmType: 'img'}).then(val => val.wmLength)

imgDom、waterMarkImgDom 均为原图 img 标签。
```

|  参数   | 说明  | 类型 | 可选值 | 默认值 | 必填 |
|  ----  | ----  |  ----  |  ----  |  ----  | ----  | 
| originImg  | 原图 | img 标签 | - | - | 是
| wm  | 水印内容 | 数组、字符串、img标签 | - | - | 是
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是
| name | 生成图片名称 | 字符串 | - | 'download' | 否

### 解水印

```js
1. 布尔数组
watermark.extract({wmImg: imgDom, wmLength: 5, wmType: 'bool'}).then(val => val.wm)

2. 字符串
watermark.extract({wmImg: imgDom, wmLength: 5, wmType: 'string'}).then(val => val.wm)

3. 图片水印
watermark.extract({wmImg: imgDom, wmLength: [50, 20], wmType: 'img'}).then(val => val.wm)

imgDom 为水印图 img 标签。图片水印会直接下载。
```

|  参数   | 说明  | 类型 | 可选值 | 默认值 |  必填 |
|  ----  | ----  |  ----  |  ----  |  ----  |  ----  |
| wmImg  | 水印图 | img 标签 | - | - | 是 |
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是 |
| wmLength  | 水印长度，wmType 为 'img' 时，需传入水印图片waterMarkImgDom 的 [宽， 高] | 数组、数字 | - | - | 是 |
| name | 生成图片名称 | 字符串 | - | 'download' |


### tips

1. 使用 watermark.js 为图片嵌入水印时，会较长时间占用js线程，gui 持续线程挂起，导致页面无法交互。所以请将 **页面 loading 打开**。
1. 嵌入水印时间与图片尺寸成正比，与机器性能有关，与水印类型无关。 **1125 * 630** 尺寸图片嵌入水印时间约为 **6s** 左右
1.  本库 **无法对纯 白图（255, 255, 255）**嵌入水印 （254，254，254 的图片不受影响），已对纯白区域的场景进行了考虑和优化。不过如果图片纯白区域过大，即图片有效信息过于少且集中，而水印长度很长时，可能出现水印精度较低的情况。
1. 图片水印的抗攻击性强于 布尔值数组水印 和 字符串水印，毕竟图片丢一些点也可以看出所描述的形状嘛
1. 为了提升水印嵌入速度，所以牺牲了水印最大容量，在嵌入图片水印时建议水印宽高不超过原图宽高的 *1/10*   为 *1/20* 时抗攻击效果更佳。

## 例子



## 计划
1. 考虑不阻塞 js 主线程的计算方案，当然计算时间也会增加。
1. 算法优化，增加水印抗攻击能力。
1. 考虑是否放开水印密度、鲁棒性系数等参数的配置。合理的系数配置可以增加 **水印最大容量** 、 **减少噪声**、 **减少嵌入水印时间** 。但配置不当会对水印后图片产生较大或很大噪声。

