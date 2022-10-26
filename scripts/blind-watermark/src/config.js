const baseBlockShape = 8;

const defaultConfig = {
    blockShape: baseBlockShape,  // 分块尺寸
    level: 2, // 默认加密等级
    returnSecret: false, // 返回动态密钥
    minBlockNum: 9,
    zoomMiddle: {
        blockShape: baseBlockShape * 1.25,
        coefficient: 1.25 * 1.25
    },
    zoomMax: {
        blockShape: baseBlockShape * 1.5,
        coefficient: 1.5 * 1.5
    }
};

const levelConfig = {
    1: {
        channelNumber: 1, // 默认加密通道数量
        returnSecret: false, // 返回动态密钥
        blockShape: defaultConfig.blockShape, // 分块尺寸
    },
    2: {
        channelNumber: 2, // 默认加密通道数量
        returnSecret: false, // 返回动态密钥
        blockShape: defaultConfig.blockShape, // 分块尺寸
    },
    3: {
        channelNumber: 3, // 默认加密通道数量
        returnSecret: true, // 返回动态密钥
        blockShape: null, // 分块尺寸；动态密钥模式下动态计算 blockShape
    },
    4: {
        channelNumber: 3, // 默认加密通道数量
        returnSecret: true, // 返回动态密钥
        blockShape: null, // 分块尺寸；动态密钥模式下动态计算 blockShape
    },
};

const wmTypeConfig = {
    string: 'string',
    bool: 'bool',
    img: 'img'
};

const  extendHammingCodePow = 4;

module.exports = {
    defaultConfig,
    levelConfig,
    wmTypeConfig,
    extendHammingCodePow,
};
