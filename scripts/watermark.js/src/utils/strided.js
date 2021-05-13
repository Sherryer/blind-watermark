// let testData = [
//     ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8'],
//     ['2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7', '2-8'],
//     ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8'],
//     ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7', '4-8'],
//     ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-7', '5-8'],
//     ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-8'],
//     ['7-1', '7-2', '7-3', '7-4', '7-5', '7-6', '7-7', '7-8'],
//     ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6', '8-7', '8-8'],
// ]

const againGroup = (data = [], num) => {
    let baseData = [...data]
    let result = []

    for (let i = 0, len = baseData.length; i < len; i += num) {
        let partData = data.slice(i, i + num)
        if (partData.length) {
            result.push(partData)
        }
    }
    return result
}

// 4 维度分块
const strided4 = (arr, shape = 4) => {
    // 划分为 shape * shape 矩阵

    let rowLength = arr[0].length
    let columnLength = arr.length

    let rowBlock = Math.ceil(rowLength / shape) // 一行的块数
    let columnBlock = Math.ceil(columnLength / shape) // 所有行的块数

    let fullColumnNun = Math.floor(rowLength / shape) // 完整一行的块数（列）
    let fullRowNun = Math.floor(columnLength / shape) // 完整的所有行的块数


    let result = [] // 1 维

    for (let i = 0; i < columnBlock; i++) {
        let ds = [] // 2 维
        let baseNum = shape * i

        for (let columnShapeIndex = 0; columnShapeIndex < shape; columnShapeIndex++) {
            if (arr[baseNum + columnShapeIndex]) {
                let againResult = againGroup(arr[baseNum + columnShapeIndex], shape) // 4 维
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
}

const spreadStrided4 = (arr) => {
    let result = []
    arr.forEach((item, index) => { //第 1 维
        let lines = []
        item.forEach((val, ind) => { // 第 2 维
            val.forEach((v, i) => { // 第 3 维 v 是块中一行的数据
                if (!lines[i]) {
                    lines[i] = []
                }
                lines[i] = [...lines[i], ...v]
            })
        })
        result = [...result, ...lines]
    })

    return result
}

export default {
    strided4,
    spreadStrided4
}
