# changelog

### 0.0.6

1. 移除 numjs 依赖

### 0.0.7

1. 打包方案切换为 rollup

### 0.0.9

1. 为了更好的支持 Worker，将打包方案切换为 webpack
2. 在 web Worker 中为图片打水印，不再阻塞 gui 线程，水印时间缩短 30%

### 0.0.10

1. originImg、wm、wmImg 字段在支持 dom 的基础上额外支持 File 和 FileList，其中 FileList 只会读取 FileList[0] 的数据

### 0.0.11

1. 优化纯白图片的水印效果

### 0.0.12
1. 支持水印图以 File 格式返回。
1. 增加默认下载水印图参数 download，默认为 true。

### 0.1.1
1. 支持 node
2. web 版下新增水印图片 base64 返回值

### 0.1.2
1. 报错方式统一采用 Promise.reject
