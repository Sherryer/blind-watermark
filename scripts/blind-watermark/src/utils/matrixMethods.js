const numeric = require('numeric');

// 转置矩阵
const transform = (array) => {
    if (!array || !array[0] || array[0][0] === undefined) {
        return Promise.reject('二维矩阵不合法')
    }
    let m = array.length; // 行
    let n = array[0].length; // 列
    let resArr = [];
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (!resArr[j]) {
                resArr[j] = []
            }
            resArr[j][i] = array[i][j]
        }
    }
    return resArr
};

// 对角矩阵
const diag = (arr) => {
    let len = arr.length;
    let zeroArr = new Array(len).fill(0);
    let result = [];
    arr.forEach((value, index) => {
        let current = [...zeroArr];
        current[index] = value;
        result.push(current)
    });
    return result
};

// 矩阵乘法
const dot = (a, b) => {
    if (a[0].length !== b.length) {
        return Promise.reject('矩阵不匹配，无法点乘');
    }
    let m = a.length;
    let p = a[0].length;
    let n = b[0].length;

    // 初始化 m*n 全 0 二维数组
    let result = new Array(m).fill(0).map(arr => new Array(n).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            for (let k = 0; k < p; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return result;
};

// 求矩阵 svd
const getUSV = (matrix) => {
    let {
        U,
        S,
        V
    } = numeric.svd(matrix);

    let height = matrix.length;
    let width = matrix[0].length;

    let heightPosition = 0;
    let widthPosition = 0;

    const addPosition = () => {
        widthPosition++;
        if (widthPosition >= width) {
            widthPosition = 0;
            heightPosition++
        }
        if (heightPosition >= height) {
            return Promise.reject('bad matrix case')
        }
    };

    while (S.includes(NaN)) {
        matrix[heightPosition][widthPosition] = ~~(matrix[heightPosition][widthPosition] + 0.5);
        let USV = numeric.svd(matrix);
        U = USV.U;
        S = USV.S;
        V = USV.V;
        addPosition()
    }

    return {U, S, V}
};

module.exports = {
    transform,
    diag,
    dot,
    getUSV,
};
