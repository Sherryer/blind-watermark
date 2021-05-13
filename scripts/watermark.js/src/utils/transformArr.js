// 转置矩阵

export default (array) => {
    if (!array || !array[0] || !array[0][0]) {
        console.error('请输入二维矩阵')
        return
    }

    let m = array.length // 行
    let n = array[0].length // 列

    let resArr = []

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (!resArr[j]) {
                resArr[j] = []
            }
            resArr[j][i] = array[i][j]
        }
    }

    return resArr
}
