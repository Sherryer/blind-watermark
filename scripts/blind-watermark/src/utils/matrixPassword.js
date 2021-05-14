import numeric from 'numeric'
import {diag, dot, transform} from "./matrixMethods"
import againGroup from './againGroup'

const d1 = 20;
const d2 = 6;

const mixRobust = (data, robust, noise) => {
    return (Math.floor(data / robust) + 0.25 + 0.5 * Number(noise)) * robust
};

const getUSV = (matrix) => {
    let {
        U,
        S,
        V
    } = numeric.svd(matrix);

    let height = matrix.length
    let width = matrix[0].length

    let heightPosition = 0
    let widthPosition = 0

    const addPosition = () => {
        widthPosition++
        if (widthPosition >= width) {
            widthPosition = 0
            heightPosition++
        }
        if (heightPosition >= height) {
            throw new Error('bad matrix case')
        }
    }

    while (S.includes(NaN)) {
        matrix[heightPosition][widthPosition] = Math.round(matrix[heightPosition][widthPosition])
        let USV = numeric.svd(matrix);
        U = USV.U
        S = USV.S
        V = USV.V
        addPosition()
    }

    return {U, S, V}
}

const encode = (matrix, password = true) => {
    let {
        U,
        S,
        V
    } = getUSV(matrix);

    S[0] = mixRobust(S[0], d1, password)
    S[1] = mixRobust(S[1], d2, password)

    return dot(U, dot(diag(S), transform(V)))
};

const decode = (matrix, average = 0.5) => {
    // 低频 356 对应 253 以上颜色
    // 如果区域颜色均值大于 356 说明为白色块，无信息记录，不保存密码权重

    let avg = eval(matrix.join(',').replaceAll(',', '+')) / (matrix.length * matrix[0].length)
    if (avg > 360) {
        return average
    }

    let {S} = getUSV(matrix);

    let wm0 = Number(S[0] % d1 > d1 / 2);
    let wm1 = Number(S[1] % d2 > d2 / 2);

    return (3 * wm0 + wm1) / 4
};

export default {
    encode,
    decode,
}
