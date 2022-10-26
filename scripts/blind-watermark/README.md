# blind-watermark

blindWatermark 是一个用于给图片嵌入数字水印的前端库。解水印 **不需要原图** 。

支持 web 和 node。（web 中加的水印可在 node 中反解，反之同理）

可嵌入水印类型分别为：布尔值数组、字符串、图片。

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


## web useage

```js
import watermark from 'blind-watermark'
```

### 嵌入水印

```js
1. 布尔数组
watermark.addWm({originImg: img, wm:[true, true, false, false] , wmType: 'bool'}).then(
({wmLength,
  File,
  base64,
  key,}) => ())

2. 字符串
watermark.addWm({originImg: img, wm: '测试数据噢', wmType: 'string'}).then(
({wmLength,
  File,
  base64,
  key,}) => ())

3. 图片水印
watermark.addWm({originImg: img, wm: waterMarkImgDom, wmType: 'img'}).then(
({wmLength,
  File,
  base64,
  key,}) => ())


返回值：
wmLength：水印长度
base64：生成图片 base64
File： 生成图片的 File 格式
key: 解密密钥 （当 level 大于 2 时候返回 key，key是用于解密的唯一手段。传入key解密时无需传入 wmType、wmLength  ）
```

|  参数   | 说明  | 类型 | 可选值 | 默认值 | 必填 | 备注 |
|  ----  | ----  |  ----  |  ----  |  ----  | ----  | ----  | 
| originImg  | 原图 | img 标签、File、FileList | - | - | 是 | FileList 只会取 FileList[0] 进行计算
| wm  | 水印内容 | 数组、字符串、(img标签、File、FileList) | - | - | 是 | FileList 只会取 FileList[0] 进行计算
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是
| name | 生成图片名称 | 字符串 | - | 'download' | 否
| level | 水印等级 | 数值 | 1 2 3 4 | 2 | 否 | level 是水印的加密等级。等级越高效果越好，耗时越长。 **level 为 3 4 时会返回字段 key，key 是在level为 3 4 时用于解密的唯一方法，请妥善保管**
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
| level | 图片加密等级 | 数字 | 1 2 3 4 | 2 | 否 |  level 大于 2 时需要传入 key。key 在加密时获取 |
| key | 当level 大于 2 时解水印的密钥；传入key 就 **不需要** 传 wmType、wmLength 了  | 字符串 | - | - | 否 | 

### tips

1. 使用 watermark.js 为图片嵌入水印时，会尝试开启 Worker，**在不支持 Worker** 的浏览器中会较长时间占用 js 线程，gui 线程持续挂起，导致页面无法交互。所以建议在不支持 worker 的浏览器中 **页面 loading 打开** 。
2. 嵌入水印时间与图片尺寸成正比，与机器性能有关，与水印类型无关。 **1125 * 630** 尺寸图片嵌入水印时间约为 **2.5s** 左右。
3. wmImg 最大支持 4k*4k尺寸


## node useage

```js
const watermark = require('blind-watermark/lib/node')
```

### 嵌入水印

```js
1. 布尔数组
watermark.addWm({originImg: img, wm:[true, true, false, false] , wmType: 'bool'}).then(val => val)

2. 字符串
watermark.addWm({originImg: img, wm: '测试数据噢', wmType: 'string'}).then(val => val)

3. 图片水印
watermark.addWm({originImg: img, wm: waterMarkImgDom, wmType: 'img'}).then(val => val)

返回值：
wmLength：水印长度
base64：图片 base64
filePath： 生成图片路径
key: 解密密钥 （当 level 大于 2 时候返回 key，key是用于解密的唯一手段。传入key解密时无需传入 wmType、wmLength  ）
```

|  参数   | 说明  | 类型 | 可选值 | 默认值 | 必填 | 备注 |
|  ----  | ----  |  ----  |  ----  |  ----  | ----  | ----  | 
| originImg  | 原图路径、网络地址 | string | - | - | 是 | -
| wm  | 水印内容 | 数组、字符串、图片路径 | - | - | 是 | -
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是
| name | 生成图片名称 | 字符串 | - | \`output-${new Date().getTime()}` | 否
| outputPath | 生成图片路径 | string | - | 'blindWaterMarkOutput' | 否
| level | 水印等级 | 数值 | 1 2 3 4 | 2 | 否 | level 是水印的加密等级。等级越高效果越好，耗时越长。 **level 为 3 4 时会返回字段 key，key 是在level为 3 4 时用于解密的唯一方法，请妥善保管**

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
| wmImg  | 水印图片地址 | string | - | - | 是 | -
| wmType | 水印类型 | 字符串 | 'bool' 'string' 'img' | - | 是 |
| wmLength  | 水印长度，wmType 为 'img' 时，需传入水印图片waterMarkImgDom 的 [宽， 高] | 数组、数字 | - | - | 是 |
| name | 生成图片名称 | 字符串 | - | \`output-${new Date().getTime()}` |
| outputPath | 生成图片路径 | string | - | 'blindWaterMarkOutput' | 否
| level | 图片加密等级 | 数字 | 1 2 3 4 | 2 | 否 |  level 大于 2 时需要传入 key。key 在加密时获取 |
| key | 当level 大于 2 时解水印的密钥；传入key 就 **不需要** 传 wmType、wmLength 了  | 字符串 | - | - | 否 | 

## 例子

[文件](https://github.com/Sherryer/watermark.js/blob/master/src/index.jsx)

[项目](https://github.com/Sherryer/watermark.js)

web example

```
git clone git@github.com:Sherryer/watermark.js.git
cd /watermark.js
npm install
npm run start
```

node example

```
git clone git@github.com:Sherryer/blind-watermark.git
cd /watermark.js
node  nodeWm.js
```

## changelog

[changelog](https://github.com/Sherryer/blind-watermark/blob/master/scripts/blind-watermark/changelog.md)


## 历史版本 doc
[0.1.7](https://github.com/Sherryer/blind-watermark/blob/master/scripts/blind-watermark/docs/0.1.7.md)
