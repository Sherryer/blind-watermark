const {DCT, IDCT} = require('dct2');
const {diag, dot, transform, getUSV} = require('./matrixMethods');

const d1 = 36;
const d2 = 20;

const mixRobust = (data, robust, noise) => {
    return (Math.floor(data / robust) + 0.25 + 0.5 * Number(noise)) * robust
};

const getArraySum = (arr) => {
    let sum = 0;
    const getSum = (arr) => {
        arr.forEach((item) => {
            if (Array.isArray(item)) {
                getSum(item);
                return
            }
            sum = sum + item
        })
    };
    getSum(arr);
    return sum
};

const encode = (matrix, password = true) => {
    const signal = DCT(matrix);

    let { U, S, V } = getUSV(signal);
    S[0] = mixRobust(S[0], d1, password);
    S[1] = mixRobust(S[1], d2, password);
    const encodeSignal = dot(U, dot(diag(S), transform(V)));

    return IDCT(encodeSignal)
};

const decode = (matrix) => {
    const signal = DCT(matrix);
    let {S} = getUSV(signal);
    let wm0 = Number(S[0] % d1 > 0.5 * d1);
    let wm1 = Number(S[1] % d2 > 0.5 * d2);

    return (3 * wm0 + wm1) / 4
};

module.exports = {
    encode,
    decode,
};
