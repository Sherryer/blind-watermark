### wasm 环境搭建

[mdn_编译 C/C++ 为 WebAssembly](https://developer.mozilla.org/zh-CN/docs/WebAssembly/C_to_wasm)

### 目录结构
```
wasm                ------- 通过 wasm 实现功能的文件夹
|-xxxx              ------- 功能代码文件夹
    |- xxxx.c       ------- c 源码
    |- xxxx.html    ------- 构建产物
    |- xxxx.js      ------- 构建产物 胶水代码 （可作为node 入口）
    |- xxxx.wasm    ------- 构建产物
    |- index.js     ------- web、node 入口(对胶水代码改造)
```

### 胶水代码改造

1. 倒出 module

```
module.exports = Module
```

2. 修改胶水代码

```
1.
function getBinaryPromise() {
  if (ENVIRONMENT_IS_NODE) {
    return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
  }
  var wasm = require('./xxxx.wasm');
  return Promise.resolve(wasm);
}

2.
function instantiateAsync() {
  return instantiateArrayBuffer(receiveInstantiationResult);
}
```

3. 可运行时机调整（load 耗时 14 ms）

```
const createPromiseCallback = () => {
  let callback
  let promise = new Promise((res, rej) => {
    callback = () => {
      res()
    }
  })
  return [promise, callback]
}

const [promise, callback] = createPromiseCallback();

Module.onRuntimeInitialized = callback;

Module.onload = promise;
```


