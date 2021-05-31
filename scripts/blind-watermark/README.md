# blind-watermark

blindWatermark 是一个用于给图片嵌入数字水印的前端库。解水印 **不需要原图** 。

可嵌入水印类型分别为：布尔值数组、字符串、图片。

水印具有一定的抗攻击能力，比如马赛克、水平裁剪。当前版本垂直剪裁会破坏原图。


## 效果
#### 原图：
1680 * 1066 尺寸；3,347,187字节；

![img](https://raw.githubusercontent.com/Sherryer/blind-watermark/master/scripts/blind-watermark/origin.png)

#### 水印后：
1680 * 1066 尺寸；3,376,079 字节；

水印内容：'测试数据噢'

![img](https://raw.githubusercontent.com/Sherryer/blind-watermark/master/scripts/blind-watermark/wm.png)

## 安装
```js
npm install --save  blind-watermark
```


## 使用

```js
import watermark from 'blind-watermark'
```

### 嵌入水印

```js
1. 布尔数组
watermark.addWm({originImg: img, wm:[true, true, false, false] , wmType: 'bool'}).then(val => val.wmLength)

2. 字符串
watermark.addWm({originImg: img, wm: '测试数据噢', wmType: 'string'}).then(val => val.wmLength)

3. 图片水印
watermark.addWm({originImg: img, wm: waterMarkImgDom, wmType: 'img'}).then(val => val.wmLength)

imgDom、waterMarkImgDom 均为原图 img 标签。
```

|  参数   | 说明  | 类型 | 可选值 | 默认值 | 必填 | 备注 |
|  ----  | ----  |  ----  |  ----  |  ----  | ----  | ----  | 
| originImg  | 原图 | img 标签、File、FileList | - | - | 是 | FileList 只会取 FileList[0] 进行计算
| wm  | 水印内容 | 数组、字符串、(img标签、File、FileList) | - | - | 是 | FileList 只会取 FileList[0] 进行计算
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是
| name | 生成图片名称 | 字符串 | - | 'download' | 否
| download | 下载生成后的水印图 | 布尔 | true false | true | 否

### 解水印

```js
1. 布尔数组
watermark.extract({wmImg: img, wmLength: 5, wmType: 'bool'}).then(val => {})

2. 字符串
watermark.extract({wmImg: img, wmLength: 5, wmType: 'string'}).then(val => {})

3. 图片水印
watermark.extract({wmImg: img, wmLength: [50, 20], wmType: 'img'}).then(val => {})
```

|  参数   | 说明  | 类型 | 可选值 | 默认值 |  必填 | 备注 |
|  ----  | ----  |  ----  |  ----  |  ----  |  ----  | ----  |
| wmImg  | 水印图 | img 标签、File、FileList | - | - | 是 | FileList 只会取 FileList[0] 进行计算
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是 |
| wmLength  | 水印长度，wmType 为 'img' 时，需传入水印图片waterMarkImgDom 的 [宽， 高] | 数组、数字 | - | - | 是 |
| name | 生成图片名称 | 字符串 | - | 'download' |

### tips

1. 使用 watermark.js 为图片嵌入水印时，会尝试开启 Worker，**在不支持 Worker** 的浏览器中会较长时间占用 js 线程，gui 线程持续挂起，导致页面无法交互。所以建议在不支持 worker 的浏览器中 **页面 loading 打开** 。
1. 嵌入水印时间与图片尺寸成正比，与机器性能有关，与水印类型无关。 **1125 * 630** 尺寸图片嵌入水印时间约为 **4.5s** 左右。
1. 图片水印的抗攻击性强于 布尔值数组水印 和 字符串水印，毕竟图片丢一些点也可以看出所描述的形状嘛
1. 为了提升水印嵌入速度，所以牺牲了水印最大容量，在嵌入图片水印时建议水印宽高不超过原图宽高的 *1/10*   为 *1/20* 时抗攻击效果更佳。

## 例子

[文件](https://github.com/Sherryer/watermark.js/blob/master/src/index.jsx)

[项目](https://github.com/Sherryer/watermark.js)

```
git clone git@github.com:Sherryer/watermark.js.git
cd /watermark.js
npm install
npm run start
```

## changelog

[changelog](https://github.com/Sherryer/blind-watermark/blob/master/scripts/blind-watermark/changelog.md)

## 计划
1. 考虑不阻塞 js 主线程的计算方案。 ✅
1. 算法优化，增加水印鲁棒性。
1. 考虑 是否、如何 放开水印密度、鲁棒性系数等参数的自定义配置。合理的系数配置可以增加 **水印最大容量** 、 **减少噪声**、 **减少嵌入水印时间** 。但配置不当会对水印后图片产生较大或很大噪声。
1. 考虑水印密钥优化，由现在的长度+类型优化为密钥。

