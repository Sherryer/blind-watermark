const privateWt = require('./utils/privateWt');
const imgData = require('./utils/imgData');
const strided = require('./utils/strided');
const matrixPassword = require('./utils/matrixPassword');
const stringCode = require('./utils/stringCode');
const { value2Secret, secret2Value } = require('./utils/getReturnSecret');
const mixWatermark = require('./mixWatermark/index');
const extendHammingCode = require('extended-hamming-code');
const { defaultConfig, levelConfig, wmTypeConfig, extendHammingCodePow} = require('./config');

const {
    encode,
    decode,
} = extendHammingCode.setConfig({
    pow: extendHammingCodePow
})

class ChannelBase {
    constructor() {
        this.blockShape = defaultConfig.blockShape;
        this.channelNumber = levelConfig[defaultConfig.level].channelNumber;
        this.returnSecret = defaultConfig.returnSecret;
        this.level = null;

        this.singleChannel2dArray = {
            R2d: null,
            G2d: null,
            B2d: null,
        };
    }
    resetData() {
        this.lowChannel = [];
        this.heightChannel = [];
        this.wmBoolList = [];

        this.singleChannel2dArray = {
            R2d: null,
            G2d: null,
            B2d: null,
        };

        this.addWidth = false;
        this.addHeight = false;
    }
    async setConfig({ level = defaultConfig.level, blockShape }) {
        this.level = level;
        if (!levelConfig[+level]) {
            return Promise.reject(`level 只能为 1、2、3、4，当前值：${level}`);
        }

        const {
            channelNumber, // 默认加密通道数量
            returnSecret, // 返回动态密钥
            blockShape: defaultBlockShape,
        } = levelConfig[+level];

        this.blockShape = blockShape || defaultBlockShape;
        this.channelNumber = channelNumber;
        this.returnSecret = returnSecret;
    }
}

class ImgMethod extends ChannelBase {
    constructor() {
        super();
        this.imgHandle = imgData;
        this.mixWatermark = mixWatermark
    }

    // 读原图，补白边，分通道，获取 rgb 通道低频分量、低频分量四维化
    async readImg(img) {
        let {
            width,
            height,
            R2d,
            G2d,
            B2d,
            A1d,
        } = await this.imgHandle.getData(img, true);

        this.A1d = A1d;
        this.width = width;
        this.height = height;

        // 如果宽高非偶数，图像补白边
        if (width % 2 !== 0) {
            this.addWidth = true;
            [R2d, G2d, B2d].map((value) => (
                value.map(item => {
                    item[width] = 0;
                    return item
                })
            ))
        }

        if (height % 2 !== 0) {
            this.addHeight = true;
            R2d[height] = new Array(width).fill(0);
            G2d[height] = new Array(width).fill(0);
            B2d[height] = new Array(width).fill(0);
        }

        this.singleChannel2dArray = {
            R2d,
            G2d,
            B2d,
        };

        [R2d, G2d, B2d].slice(0, this.channelNumber).forEach((item, index) => {
            let [low, height] = privateWt.dwt(item);
            this.lowChannel[index] = low;
            this.heightChannel[index] = height;
        })
    }

    // 读水印
    async readWm(wm, wmType = wmTypeConfig.bool) {
        if (!wm) {
            return Promise.reject('参数错误：请输入水印')
        }
        if (wmType === wmTypeConfig.bool) {
            if (wm.find(item => typeof item !== 'boolean')) {
                return Promise.reject('参数错误：水印中存在非布尔值，请检查')
            }

            let {
                width,
                height,
                blockShape,
                returnSecret,
            } = this;

            // let maxWidth = Math.floor((width + 1) / (2 * blockShape));
            let maxWidth = ~~((width + 1) / (2 * blockShape));
            // let maxHeight = Math.floor((height + 1) / blockShape);
            let maxHeight = ~~((height + 1) / blockShape);

            let lowChannelMaxLength = maxWidth * maxHeight;

            if (wm.length > lowChannelMaxLength) {
                return Promise.reject(`最多可嵌入${lowChannelMaxLength / 1000}kb信息，当前信息过大约为${wm.length / 1000}`)
            }

            /** 自动分块暂时取消
             // 根据水印长度做 block 缩放
            let block = blockShape;
            if ((lowChannelMaxLength / wm.length / defaultConfig.zoomMax.coefficient) >= defaultConfig.minBlockNum) {
                block = defaultConfig.zoomMax.blockShape
            } else if ((lowChannelMaxLength / wm.length / defaultConfig.zoomMiddle) >= defaultConfig.minBlockNum) {
                block = defaultConfig.zoomMiddle.blockShape
            }
            // 动态密钥场景下自动分块
            if (returnSecret) {
                this.blockShape = block
            }
            **/

            let hammingWmString = encode(wm.map(item => Number(item)).join(''));
            this.wmBoolList = hammingWmString.split('').map(item => item > 0.5 );
            this.wmLength = hammingWmString.length;
            return;
        }

        if (wmType === wmTypeConfig.string) {
            let code = stringCode.str2charCode(wm);
            let boolList = code.split('').map(val => +val === 1);
            return this.readWm(boolList, 'bool')
        }

        if (wmType === wmTypeConfig.img) {
            let {
                width,
                height,
                data
            } = await this.imgHandle.getTwoEnds(wm);
            this.imgWmSize = [width, height];
            return this.readWm(data, wmTypeConfig.bool)
        }
        return Promise.reject(`参数错误：水印类型错误，请输入 bool | string | img, 当前为 ${wmType}`)
    }

    async mixWm({ name, download, outputPath, useWasm }) {
        if (this.wmBoolList.length === 0) {
            return
        }
        let {
            A1d,
            width,
            height,
            lowChannel,
            heightChannel,
            wmBoolList,
            addHeight,
            addWidth,
            blockShape,
            singleChannel2dArray,
        } = this;

        let {
            R2d,
            G2d,
            B2d,
        } = singleChannel2dArray;

        let [R = R2d, G = G2d, B = B2d] = await this.mixWatermark({
            lowChannel,
            heightChannel,
            wmBoolList,
            blockShape,
            useWasm,
        });
        if (addHeight) {
            [R, G, B].forEach(channelData => channelData.pop())
        }
        if (addWidth) {
            [R, G, B].forEach(channelData => channelData.forEach(item => item.pop()))
        }
        this.resetData();
        name = name ? `${name.split('.')[0]}.png` : `download-${new Date().getTime()}.png`
        return await this.imgHandle.setData({R, G, B, A: A1d, width, height, download, name, outputPath})
    }
}

class Watermark extends ImgMethod {
    constructor() {
        super();
    }

    getWmResult (wmList, type, imgWmShape, name, outputPath) {
        if (type === wmTypeConfig.bool) {
            return wmList
        }

        if (type === wmTypeConfig.string) {
            let numCode = wmList.map(val => Number(val)).join('');
            return stringCode.charCode2str(numCode)
        }

        if (type === wmTypeConfig.img) {
            let [width, height] = imgWmShape;
            this.imgHandle.setTwoEnds({data: wmList, width, height, name, outputPath})
        }
    }

    // 解水印
    async extract({wmImg, wmLength, wmType, name, outputPath, level = defaultConfig.level, key}) {
        let writeBlockShape = null;
        if (key) {
            let {
                wmType: keyWmType,
                level: keyLevel,
                blockShape: keyBlockShape,
                wmLength: keyWmLength,
            } = secret2Value(key);
            wmType = keyWmType;
            level = keyLevel;
            wmLength = keyWmLength;
            writeBlockShape = keyBlockShape
        }

        if (!wmLength) {
            return Promise.reject(`参数错误：请输入水印长度, 水印类型为 string bool 时，wmLength 输入数字，水印类型为 img 时，wmLength 为二维数组代表图片宽高 [width, height]`)
        }
        if (wmType === wmTypeConfig.string || wmType === wmTypeConfig.bool) {
            if (isNaN(Number(wmLength))) {
                return Promise.reject(`参数错误：wmLength 需为数字，代表水印长度`)
            }
        }
        if (wmType === wmTypeConfig.img) {
            if (!Array.isArray(wmLength) || wmLength.length !== 2) {
                return Promise.reject('参数错误：wmLength 需为数组，[width, height]')
            }
        }

        await this.setConfig({ level, blockShape: writeBlockShape });

        let currentTypeWmLength = wmLength;
        if (wmType === wmTypeConfig.string) {
            currentTypeWmLength = wmLength * 16 // 每个字符转为 16 位编码
        }
        if (wmType === wmTypeConfig.img) {
            currentTypeWmLength = wmLength[0] * wmLength[1]
        }

        // 通过当前长度计算 汉明码加密后长度。
        let hammingCodeWmLength = encode(''.padStart(currentTypeWmLength, 1)).length;

        this.resetData();
        await this.readImg(wmImg);
        let passWordList = [];
        let fullRowNun,
            fullColumnNun;
        let {
            lowChannel,
            blockShape,
        } = this;

        lowChannel = lowChannel.map((channal) => {
            let block4 = strided.strided4(channal, blockShape);
            fullRowNun = block4.fullRowNun;
            fullColumnNun = block4.fullColumnNun;
            return block4.result
        });

        let channelWmAndpassWordList  = [];
        let channelWmArray = lowChannel.map((channel, index) => {
            let result = [];
            let position = 0;
            for (let i = 0; i < fullRowNun; i++) {
                for (let j = 0; j < fullColumnNun; j++) {
                    let item = channel[i][j];
                    let password = matrixPassword.decode(item);
                    let _index = [position % hammingCodeWmLength];
                    if (!passWordList[_index]) {
                        passWordList[_index] = []
                        channelWmAndpassWordList[_index] = []
                    }
                    passWordList[_index].push(password);
                    channelWmAndpassWordList[_index].push({password, item, index: position + index*fullRowNun*fullColumnNun});
                    position++;
                    result.push({
                        password,
                        item
                    });
                }
            }
            return result
        });

        let wmList = passWordList.map((arr) => (eval(arr.join('+')) / arr.length) > 0.5 ? '1' : '0');
        let numList = passWordList.map((arr) => (eval(arr.join('+')) / arr.length))
        // ⬇️
        // console.log(passWordList);
        // console.log('wmList', wmList);
        // console.log(channelWmAndpassWordList);
        // window.channelWmAndpassWordList = channelWmAndpassWordList;
        // window.matrixPassword = matrixPassword;
        // window.channelFlag = channelWmArray.flat();
        // console.log(numList)
        // ⬆️
        let decodeList = decode(wmList.join('')).code.split('').map(item => item > 0.5)
        let result = this.getWmResult(decodeList, wmType, wmLength, name, outputPath);
        return new Promise((res) => {
            res({
                wm: result
            })
        })
    }

    async addWm({
        originImg, // 原图
        wm, // 水印
        wmType, // 水印类型
        name, // 图片名称
        download, // 下载水印图片 仅 web
        outputPath, // 水印图片存放路径 仅 node
        useWasm, // 启用 wasm 加速
        level, // 等级
    }) {
        this.resetData();
        return new Promise(async (res, rej) => {
            this.setConfig({ level })
                .then(() => this.readImg(originImg))
                .then(() => this.readWm(wm, wmType))
                .then(() => this.mixWm({ name, download, outputPath, useWasm: useWasm && !!WebAssembly }).catch(e => rej(e)))
                .then(({
                   File,
                   base64,
                   filePath
                }) => {
                    let wmLength = this.wmLength;
                    let key = null;
                    if (wmType === wmTypeConfig.img) {
                        wmLength = this.imgWmSize
                    }
                    if (this.returnSecret) {
                        key = value2Secret({ level, wmType, blockShape: this.blockShape, wmLength })
                    }
                    res({
                        wmLength,
                        File,
                        base64,
                        filePath,
                        key,
                    })
                }).catch((e) => rej(e))
        })
    }
}

module.exports = Watermark;
