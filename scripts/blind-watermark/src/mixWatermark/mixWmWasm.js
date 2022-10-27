const matrixPassword = require('../utils/matrixPassword');
const wasmMartixPassword = require('../wasm/mp-float/index');
const strided = require('../utils/strided');
const againGroup = require('../utils/againGroup');
const privateWt = require('../utils/privateWt');

const d1 = 36;
const d2 = 20;

module.exports = async ({
    lowChannel,
    heightChannel,
    wmBoolList,
    blockShape,
    useWasm,
}) => {

    let wmLength = wmBoolList.length;
    let fullRowNun, fullColumnNun;

    lowChannel = lowChannel.map((channal) => {
        let obj = strided.strided4(channal, blockShape);
        fullRowNun = obj.fullRowNun;
        fullColumnNun = obj.fullColumnNun;
        return obj.result
    });

    await wasmMartixPassword.onload;

    // const wasmMartixPasswordEncode = (item, password) => {
    //     const length = item.length;
    //     const flatItem = item.flat();
    //     const ptr = wasmMartixPassword._malloc(8 * length * length);
    //
    //     // 赋初值
    //     const point = ptr >> 3;
    //     for (let i = 0; i < length * length; i++) {
    //         // console.log('flatItem[i]', flatItem[i]);
    //         wasmMartixPassword.HEAPF64[point + i] = flatItem[i]
    //     }
    //
    //     const encodeResPtr = wasmMartixPassword._encode(ptr, length, Number(password));
    //
    //     const encodeArr = [];
    //     for (let i = 0; i < length * length; i++) {
    //         encodeArr.push(wasmMartixPassword.HEAPF64[(encodeResPtr >> 3) + i]);
    //     }
    //
    //     wasmMartixPassword._free(ptr);
    //     wasmMartixPassword._free_buf(encodeResPtr);
    //     return againGroup(encodeArr, length);
    // }

    const wasmMartixPasswordEncode32 = (item, password) => {
        const length = item.length;
        const flatItem = item.flat();
        const ptr = wasmMartixPassword._malloc(4 * length * length);

        // 赋初值
        const point = ptr >> 2;
        for (let i = 0; i < length * length; i++) {
            // console.log('flatItem[i]', flatItem[i]);
            wasmMartixPassword.HEAPF32[point + i] = flatItem[i]
        }

        const encodeResPtr = wasmMartixPassword._encode(ptr, length, Number(password), d1, d2);

        const encodeArr = [];
        for (let i = 0; i < length * length; i++) {
            encodeArr.push(wasmMartixPassword.HEAPF32[(encodeResPtr >> 2) + i]);
        }

        wasmMartixPassword._free(ptr);
        wasmMartixPassword._free_buf(encodeResPtr);
        return againGroup(encodeArr, length);
    }

    let lowChannelBlockList = [];
    lowChannel.forEach((channel, index) => {
        let position = 0;
        for (let i = 0; i < fullRowNun; i++) {
            for (let j = 0; j < fullColumnNun; j++) {
                let item = channel[i][j];
                let password = wmBoolList[position % wmLength];
                position++;
                if (useWasm) {
                    channel[i][j] = wasmMartixPasswordEncode32(item, password);
                } else {
                    channel[i][j] = matrixPassword.encode(item, password);
                }

                // lowChannelBlockList.push({
                //     index: position + index * fullRowNun * fullColumnNun,
                //     // before: item,
                //     after: channel[i][j]
                // })
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
