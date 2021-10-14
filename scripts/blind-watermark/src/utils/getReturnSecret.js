const { wmTypeConfig } = require('../config');

// key 加密 解密
const encode = (num, scale = 2) => {
    return (+num).toString(scale).padStart(4, '0').split('').reverse().join('')
};

const decode = (str, scale = 2) => {
    return parseInt(str.split('').reverse().join(''), scale)
};


const value2Secret = ({ wmType, level, blockShape, wmLength }) => {
    let wm;
    if (wmType === wmTypeConfig.img) {
        wm = encodeURIComponent(wmLength)
    } else {
        wm = encode(wmLength, 32)
    }
    return `${wmType}-${encode(level)}-${encode(blockShape)}-${wm}`
};

const secret2Value = (secret) => {
    let [wmType, level, blockShape, wmLength] = secret.split('-');
    if (wmType === wmTypeConfig.img) {
        wmLength = decodeURIComponent(wmLength).split(',')
    } else {
        wmLength = decode(wmLength, 32)
    }
    return {
        wmType,
        level: decode(level),
        blockShape: decode(blockShape),
        wmLength,
    }
};

module.exports = {
    value2Secret,
    secret2Value,
};
