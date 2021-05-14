import privateWt from './utils/privateWt'
import imgD from './utils/imgData'
import strided from './utils/strided'
import matrixPassword from './utils/matrixPassword'
import stringCode from './utils/stringCode'

var d = 1
var aabbcc = `啊哈${d}`

console.log(aabbcc)

const getWmResult = (wmList, type, imgWmShape, name) => {
    if (type === 'bool') {
        return wmList
    }

    if (type === 'string') {
        let numCode = wmList.map(val => Number(val)).join('')
        return stringCode.charCode2str(numCode)
    }

    if (type === 'img') {
        let [width, height] = imgWmShape
        imgD.setTwoEnds({data: wmList, width, height}, name)
    }
}

class WaterMark {
    constructor() {
        this.blockShape = 8
        this.lowChannel = []
        this.heightChannel = []
        this.wmBoolList = []

        this.addWidth = false
        this.addHeight = false

        this.fullRowNun = 0
        this.fullColumnNun = 0
    }

    // 读图，获取 rgb 低频分量、四维化
    readImg(img) {
        let {
            imgData,
            width,
            height,
            R,
            G,
            B,
            A,
        } = imgD.getData(img)

        this.A = A
        this.width = width
        this.height = height

        // 如果宽高非偶数，图像补白边
        if (width % 2 !== 0) {
            this.addWidth = true
            R = R.map(item => {
                item[width] = 0;
                return item
            })
            G = G.map(item => {
                item[width] = 0;
                return item
            })
            B = B.map(item => {
                item[width] = 0;
                return item
            })
        }

        if (height % 2 !== 0) {
            this.addHeight = true
            R[height] = new Array(width).fill(0)
            G[height] = new Array(width).fill(0)
            B[height] = new Array(width).fill(0)
        }

        [R, G, B].forEach((item, index) => {
            let [low, height] = privateWt.dwt(item)
            this.lowChannel[index] = low
            this.heightChannel[index] = height
        })

        this.lowChannel = this.lowChannel.map((channal) => {
            let {
                fullRowNun,
                fullColumnNun,
                result
            } = strided.strided4(channal, this.blockShape)
            this.fullRowNun = fullRowNun
            this.fullColumnNun = fullColumnNun
            return result
        })
    }

    readWm(wm, wmType = 'bool') {
        if (!wm) {
            console.error('请输入水印', wm)
            return
        }
        if (wmType === 'bool') {
            if (wm.find(item => typeof item !== 'boolean')) {
                console.error('水印中存在非布尔值，请检查', wm)
                return
            }

            let lowChannelMaxLength = this.lowChannel.length * this.lowChannel[0].length

            if (wm.length > lowChannelMaxLength) {
                console.error(`最多可嵌入${lowChannelMaxLength / 1000}kb信息，当前信息过大约为${wm.length / 1000}`)
                return
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
            } = imgD.getTwoEnds(wm)
            this.imgWmSize = [width, height]
            this.readWm(data, 'bool')
            return
        }

        console.error('水印类型错误，请输入 bool | string | img, 当前为', wmType)
    }

    mixWm(name) {
        if (this.wmBoolList.length === 0) {
            return
        }

        // 低频分量打水印
        this.lowChannel.forEach((channel) => {
            let position = 0
            for (let i = 0; i < this.fullRowNun; i++) {
                for (let j = 0; j < this.fullColumnNun; j++) {
                    let item = channel[i][j]
                    let password = this.wmBoolList[position % this.wmLength]
                    position++
                    channel[i][j] = matrixPassword.encode(item, password)
                }
            }
        })

        let [R, G, B] = this.lowChannel.map((channel, index) => {
            let towDData = strided.spreadStrided4(channel)  // 2 维化
            let channelData = privateWt.idwt(towDData, this.heightChannel[index])
            if (this.addHeight) {
                channelData.pop()
            }
            if (this.addWidth) {
                channelData.forEach((item) => item.pop())
            }
            return channelData
        })

        let {
            A,
            width,
            height,
        } = this

        this.lowChannel = []
        this.heightChannel = []
        this.wmBoolList = []
        this.addWidth = false
        this.addHeight = false

        imgD.setData({R, G, B, A, width, height}, true, name)
    }

    addWm({originImg, wm, wmType, name}) {
        this.readImg(originImg)
        this.readWm(wm, wmType)
        this.mixWm(name)
        return new Promise((res) => {
            let wmLength =  this.wmLength
            if (wmType === 'img') {
                wmLength = this.imgWmSize
            }
            res({
                wmLength
            })
        })
    }

    extract({wmImg, wmLength, wmType, name}) {
        if (!wmLength) {
            console.error('请输入水印长度, 水印类型为 string bool 时，wmLength 输入数字，水印类型为 img 时，wmLength 为二维数组代表图片宽高 [width, height]', wmLength)
            return
        }
        if (wmType === 'string' || wmType === 'bool') {
            if (isNaN(Number(wmLength))) {
                console.error('wmLength 需为数字，代表水印长度', wmLength)
                return
            }
        }
        if (wmType === 'img') {
            if (!Array.isArray(wmLength) || wmLength.length !== 2) {
                console.error('wmLength 需为数组，[width, height]', wmLength)
                return
            }
        }

        let currentTypeWmLength = wmLength
        if (wmType === 'string') {
            currentTypeWmLength = wmLength * 16 // 每个字符转为 16 位编码
        }
        if (wmType === 'img') {
            currentTypeWmLength = wmLength[0] * wmLength[1]
        }

        this.readImg(wmImg)
        let passWordList = []
        let channelWm = this.lowChannel.map((channel) => {
            let result = []
            let position = 0
            for (let i = 0; i < this.fullRowNun; i++) {
                for (let j = 0; j < this.fullColumnNun; j++) {
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

        let result = getWmResult(wmList, wmType, wmLength, name)
        return new Promise((res, rej) => {
            res({
                wm: result
            })
        })
    }
}

let bwm = new WaterMark();

// module.exports = bwm
// export {bwm}
export default bwm
