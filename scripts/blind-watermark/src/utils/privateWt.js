// 哈尔小波变换封装
import wt from 'discrete-wavelets'

const dwt = (arr) => {
    if (!arr || arr[0] === undefined || arr[0][0] === undefined) {
        throw new Error('private wt need 2d array')
    }
    let lowPart = []
    let heightPart = []
    arr.forEach((item) => {
        let [low, height] = wt.dwt(item, 'haar')
        lowPart.push(low)
        heightPart.push(height)
    })
    return [
        lowPart,
        heightPart
    ]
}

const idwt = (lowPart, heightPart) => {
    if (!lowPart || !heightPart) {
        throw new Error('请输入低频、高频分量')
    }
    if (lowPart.length !== heightPart.length) {
        throw new Error('请输入长度相同且合法的低频、高频分量')
    }
    return lowPart.map((item, index) => {
        return wt.idwt(item, heightPart[index], 'haar')
    })
}

export default {
    dwt,
    idwt
}
