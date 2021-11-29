const matrixPassword = require('../utils/matrixPassword');
const strided = require('../utils/strided');
const privateWt = require('../utils/privateWt');

module.exports = ({
    lowChannel,
    heightChannel,
    wmBoolList,
    blockShape,
}) => {

    let wmLength = wmBoolList.length;
    let fullRowNun, fullColumnNun;

    lowChannel = lowChannel.map((channal) => {
        let obj = strided.strided4(channal, blockShape);
        fullRowNun = obj.fullRowNun;
        fullColumnNun = obj.fullColumnNun;
        return obj.result
    });

    let lowChannelBlockList = [];
    lowChannel.forEach((channel, index) => {
        let position = 0;
        for (let i = 0; i < fullRowNun; i++) {
            for (let j = 0; j < fullColumnNun; j++) {
                let item = channel[i][j];
                let password = wmBoolList[position % wmLength];
                position++;
                channel[i][j] = matrixPassword.encode(item, password);
                lowChannelBlockList.push({
                    index: position + index * fullRowNun * fullColumnNun,
                    before: item,
                    after: channel[i][j]
                })
            }
        }
    });

    // window.lowChannelBlockList = lowChannelBlockList;

    let [R, G, B] = lowChannel.map((channel, index) => {
        let towDData = strided.spreadStrided4(channel);  // 2 维化
        return privateWt.idwt(towDData, heightChannel[index]);
    });

    return Promise.resolve([R, G, B])
};
