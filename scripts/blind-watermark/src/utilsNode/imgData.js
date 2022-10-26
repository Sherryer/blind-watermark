const getPixels = require("get-pixels");
const { encode } = require('fast-png');
const path = require('path');
const fs = require('fs');

const flat = (arr) => {
    if (!arr) { return [] }
    return Promise.resolve(arr.flat())
};

const formatPixel = (pixel) => {
    if (pixel > 255) {
        return 255
    }
    if (pixel < 0) {
        return 0
    }
    return pixel
};

function getPixelsData(imgPath) {
    return new Promise((res, rej) => {
        getPixels(imgPath, (err, pixels) => {
            if (err) {
                rej(err);
                return
            }

            let shape = pixels.shape.slice();
            let width = shape[0];
            let height = shape[1];

            res({
                width,
                height,
                data: pixels.data
            })
        })
    })
}

const dataURLToFile = (dataurl, name = '')  =>{
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    let blob = new Blob([u8arr], {type: mime});
    return new window.File([blob], name, {type: mime})
};

const getData = async (imgPath, readOriginImg) => {
    let {
        data,
        width,
        height
    } = await getPixelsData(imgPath);

    let R2d = [];
    let G2d = [];
    let B2d = [];
    let A2d = [];

    let R1d = [];
    let G1d = [];
    let B1d = [];
    let A1d = [];

    let utilArr = [R2d, G2d, B2d, A2d];
    let util1dArr = [R1d, G1d, B1d, A1d];

    data.forEach((value, index) => {
        let location = index % 4;
        let position = Math.floor(index / 4);

        // 如果在读原图，则将 rgb 的 255 修改为 254，以提高水印算法的鲁棒性
        if (readOriginImg  && location !== 3) {
            +value === 255 ? value = 254 : ''
        }

        let row = Math.floor(position / width);
        let rowIndex = position % width;

        if (!utilArr[location][row]) {
            utilArr[location][row] = []
        }

        util1dArr[location][position]  = value;

        utilArr[location][row][rowIndex] = value
    });

    return {
        width,
        height,
        R2d,
        G2d,
        B2d,
        A2d,
        R1d,
        G1d,
        B1d,
        A1d,
    }
};

const setData = async ({R, G, B, A = [], width, height, outputPath, name}) => {
    let filePath = outputPath || 'blindWaterMarkOutput';

    // r g b 支持 1 维或 2 维数组 a 只支持 1 维数组
    // 数据较大时 2 维转 1 维耗时较高，可能带来住线程阻塞，三通道均改为异步
    let r = await flat(R);
    let g = await flat(G);
    let b = await flat(B);
    let a = A;

    const outputImgData = new Uint16Array(width * height * 4);

    for (let index = 0; index < a.length; index++) {
        let realIndex = index * 4;
        let pixR = Math.round(r[index]) || 0;
        let pixG = Math.round(g[index]) || 0;
        let pixB = Math.round(b[index]) || 0;
        let pixA = Math.round(a[index]) || 255;
        outputImgData[realIndex] = formatPixel(pixR);
        outputImgData[realIndex + 1] = formatPixel(pixG);
        outputImgData[realIndex + 2] = formatPixel(pixB);
        outputImgData[realIndex + 3] = formatPixel(pixA);
    }

    return new Promise((res) => {
        const dataBuffer = Buffer.from( outputImgData );

        const rawData = encode({
            data: dataBuffer,
            height,
            width
        });

        let fullFilePath = path.resolve(filePath, name)
        const writeFile = () => (
            fs.writeFile(fullFilePath, rawData, (err) => {
                if(err) throw err;
                fs.readFile(fullFilePath, (err, data) => {
                    const base64 = `data:image/png;base64,${Buffer.from(data).toString('base64')}`
                    res ({
                        File: null,
                        base64,
                        filePath
                    })
                })
            })
        );

        fs.exists(path.resolve(filePath), (exists) => {
            if (exists) {
                writeFile();
                return
            }
            fs.mkdir(path.resolve(filePath), (err) => {
                if (err) throw err;
                writeFile()
            })

        })
    })
};

// 二值化，算法比较简单，适用于简单黑白图。不考虑透明度
const getTwoEnds = async (imgPath) => {
    let {
        width,
        height,
        R1d,
        G1d,
        B1d,
        A1d,
    } = await getData(imgPath);

    let data = A1d.map((a, index) => {
        let gray = Math.max((R1d[index], G1d[index], B1d[index]));
        return gray > 127.5  // true  代表白 false 代表黑
    });

    return {
        width,
        height,
        data,
    }
};

const setTwoEnds = ({data, width, height, name, outputPath}) => {
    let numList = data.map((val) => val * 255);
    setData({
        R: numList,
        G: numList,
        B: numList,
        A: [...numList].fill(255),
        width,
        height,
        name,
        outputPath
    })
};

module.exports = {
    getData,
    setData,
    getTwoEnds,
    setTwoEnds,
};
