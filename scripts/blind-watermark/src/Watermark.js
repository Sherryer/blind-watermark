const privateWt = require('./utils/privateWt')
const imgData = require('./utils/imgData')
const strided = require('./utils/strided')
const matrixPassword = require('./utils/matrixPassword')
const stringCode = require('./utils/stringCode')
const mixWatermark = require('./mixWatermark/index')

class WaterMark {
    constructor() {
        this.blockShape = 8
        this.imgHandle = imgData
        this.mixWatermark = mixWatermark
    }

    resetData() {
        this.lowChannel = []
        this.heightChannel = []
        this.wmBoolList = []

        this.addWidth = false
        this.addHeight = false
    }

    // 读原图，获取 rgb 通道低频分量、低频分量四维化
    async readImg(img) {
        let {
            width,
            height,
            R2d,
            G2d,
            B2d,
            A1d,
        } = await this.imgHandle.getData(img, true)

        this.A1d = A1d
        this.width = width
        this.height = height

        // 如果宽高非偶数，图像补白边
        if (width % 2 !== 0) {
            this.addWidth = true
            R2d = R2d.map(item => {
                item[width] = 0;
                return item
            })
            G2d = G2d.map(item => {
                item[width] = 0;
                return item
            })
            B2d = B2d.map(item => {
                item[width] = 0;
                return item
            })
        }

        if (height % 2 !== 0) {
            this.addHeight = true
            R2d[height] = new Array(width).fill(0)
            G2d[height] = new Array(width).fill(0)
            B2d[height] = new Array(width).fill(0)
        }

        [R2d, G2d, B2d].forEach((item, index) => {
            let [low, height] = privateWt.dwt(item)
            this.lowChannel[index] = low
            this.heightChannel[index] = height
        })
    }

    // 读水印
    async readWm(wm, wmType = 'bool') {
        if (!wm) {
            throw new Error('参数错误：请输入水印')
        }
        if (wmType === 'bool') {
            if (wm.find(item => typeof item !== 'boolean')) {
                throw new Error('参数错误：水印中存在非布尔值，请检查')
            }

            let {
                width,
                height,
                blockShape,
            } = this

            let maxWidth = Math.floor((width + 1) / (2 * blockShape))
            let maxHeight = Math.floor((height + 1) / blockShape)

            let lowChannelMaxLength = maxWidth * maxHeight

            if (wm.length > lowChannelMaxLength) {
                throw new Error(`最多可嵌入${lowChannelMaxLength / 1000}kb信息，当前信息过大约为${wm.length / 1000}`)
            }

            this.wmBoolList = wm
            this.wmLength = wm.length
            return
        }

        if (wmType === 'string') {
            let code = stringCode.str2charCode(wm)
            let boolList = code.split('').map(val => val == 1)
            this.readWm(boolList, 'bool')
            return
        }

        if (wmType === 'img') {
            let {
                width,
                height,
                data
            } = await this.imgHandle.getTwoEnds(wm)
            this.imgWmSize = [width, height]
            this.readWm(data, 'bool')
            return
        }
        throw new Error(`参数错误：水印类型错误，请输入 bool | string | img, 当前为 ${wmType}`)
    }

    async mixWm({ name, download, outputPath }) {
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
        } = this

        let [R, G, B] = await this.mixWatermark({
            lowChannel,
            heightChannel,
            wmBoolList,
            addHeight,
            addWidth,
            blockShape,
        })
        this.resetData()
        return await this.imgHandle.setData({R, G, B, A: A1d, width, height, download, name})
    }

    getWmResult (wmList, type, imgWmShape, name, outputPath) {
        if (type === 'bool') {
            return wmList
        }

        if (type === 'string') {
            let numCode = wmList.map(val => Number(val)).join('')
            return stringCode.charCode2str(numCode)
        }

        if (type === 'img') {
            let [width, height] = imgWmShape
            this.imgHandle.setTwoEnds({data: wmList, width, height, name, outputPath})
        }
    }

    // 解水印
    async extract({wmImg, wmLength, wmType, name, outputPath}) {
        if (!wmLength) {
            throw new Error(`参数错误：请输入水印长度, 水印类型为 string bool 时，wmLength 输入数字，水印类型为 img 时，wmLength 为二维数组代表图片宽高 [width, height]`)
        }
        if (wmType === 'string' || wmType === 'bool') {
            if (isNaN(Number(wmLength))) {
                throw new Error(`参数错误：wmLength 需为数字，代表水印长度`)
            }
        }
        if (wmType === 'img') {
            if (!Array.isArray(wmLength) || wmLength.length !== 2) {
                throw new Error('参数错误：wmLength 需为数组，[width, height]')
            }
        }

        let currentTypeWmLength = wmLength
        if (wmType === 'string') {
            currentTypeWmLength = wmLength * 16 // 每个字符转为 16 位编码
        }
        if (wmType === 'img') {
            currentTypeWmLength = wmLength[0] * wmLength[1]
        }

        this.resetData()
        await this.readImg(wmImg)
        let passWordList = []
        let fullRowNun,
            fullColumnNun
        let {
            lowChannel,
            blockShape,
        } = this

        lowChannel = lowChannel.map((channal) => {
            let obj = strided.strided4(channal, blockShape)
            fullRowNun = obj.fullRowNun
            fullColumnNun = obj.fullColumnNun
            return obj.result
        })

        let channelWm = lowChannel.map((channel) => {
            let result = []
            let position = 0
            for (let i = 0; i < fullRowNun; i++) {
                for (let j = 0; j < fullColumnNun; j++) {
                    let item = channel[i][j]
                    let password = matrixPassword.decode(item)
                    let index = [position % currentTypeWmLength]
                    if (!passWordList[index]) {
                        passWordList[index] = []
                    }
                    passWordList[index].push(password)
                    position++
                    result.push(password)
                }
            }
            return result
        })

        let wmList = passWordList.map((arr) => (eval(arr.join('+')) / arr.length) > 0.5)
        // let numList = passWordList.map((arr) => (eval(arr.join('+')) / arr.length))
        // console.log(passWordList);

        let result = this.getWmResult(wmList, wmType, wmLength, name, outputPath)
        return new Promise((res, rej) => {
            res({
                wm: result
            })
        })
    }

    async addWm({ originImg, wm, wmType, name, download, outputPath }) {
        this.resetData()
        await this.readImg(originImg)
        await this.readWm(wm, wmType)
        let {
            File,
            base64,
            filePath
        } = await this.mixWm({ name, download, outputPath })
        return new Promise((res) => {
            let wmLength = this.wmLength
            if (wmType === 'img') {
                wmLength = this.imgWmSize
            }
            res({
                wmLength,
                File,
                base64,
                filePath
            })
        })
    }
}

module.exports = WaterMark
