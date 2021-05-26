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
