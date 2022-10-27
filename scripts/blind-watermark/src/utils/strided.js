const againGroup = require('./againGroup');

// 4 维度分块
const strided4 = (arr, shape = 4) => {
    // 划分为 shape * shape 矩阵

    let rowLength = arr[0].length;
    let columnLength = arr.length;

    let rowBlock = Math.ceil(rowLength / shape); // 一行的块数
    let columnBlock = Math.ceil(columnLength / shape); // 所有行的块数

    let fullColumnNun = ~~(rowLength / shape); // 完整一行的块数（列）
    let fullRowNun = ~~(columnLength / shape); // 完整的所有行的块数


    let result = []; // 1 维

    for (let i = 0; i < columnBlock; i++) {
        let ds = []; // 2 维
        let baseNum = shape * i;

        for (let columnShapeIndex = 0; columnShapeIndex < shape; columnShapeIndex++) {
            if (arr[baseNum + columnShapeIndex]) {
                let againResult = againGroup(arr[baseNum + columnShapeIndex], shape); // 4 维
                againResult.forEach((item, index) => {
                    if (!ds[index]) {
                        ds[index] = [] // 3 维
                    }
                    ds[index].push(item)
                })
            }
        }
        result.push(ds)
    }

    return {
        fullRowNun,
        fullColumnNun,
        result
    }
};

const spreadStrided4 = (arr) => {
    let result = [];
    arr.forEach((item) => { //第 1 维
        let lines = [];
        item.forEach((val) => { // 第 2 维
            val.forEach((v, i) => { // 第 3 维 v 是块中一行的数据
                if (!lines[i]) {
                    lines[i] = []
                }
                lines[i] = [...lines[i], ...v]
            })
        });
        result = [...result, ...lines]
    });

    return result
};

module.exports = {
    strided4,
    spreadStrided4
};
