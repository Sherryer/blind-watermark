const matrixPassword = require('../utils/matrixPassword')
const strided = require('../utils/strided')
const privateWt = require('../utils/privateWt')

module.exports = ({
    lowChannel,
    heightChannel,
    wmBoolList,
    addHeight,
    addWidth,
    blockShape,
}) => {

    let wmLength = wmBoolList.length
    let fullRowNun, fullColumnNun

    lowChannel = lowChannel.map((channal) => {
        let obj = strided.strided4(channal, blockShape)
        fullRowNun = obj.fullRowNun
        fullColumnNun = obj.fullColumnNun
        return obj.result
    })

    lowChannel.forEach((channel) => {
        let position = 0
        for (let i = 0; i < fullRowNun; i++) {
            for (let j = 0; j < fullColumnNun; j++) {
                let item = channel[i][j]
                let password = wmBoolList[position % wmLength]
                position++
                channel[i][j] = matrixPassword.encode(item, password)
            }
        }
    })

    let [R, G, B] = lowChannel.map((channel, index) => {
        let towDData = strided.spreadStrided4(channel)  // 2 维化
        let channelData = privateWt.idwt(towDData, heightChannel[index])
        if (addHeight) {
            channelData.pop()
        }
        if (addWidth) {
            channelData.forEach((item) => item.pop())
        }
        return channelData
    })

    return Promise.resolve([R, G, B])
}
