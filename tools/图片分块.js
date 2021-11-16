// 将图片分块
var imgData = require('../scripts/blind-watermark/src/utilsNode/imgData');
const getPixels = require("get-pixels");
const path = require('path');
const blockShapeWidth = 16; // 16 * 8 分成的块
const blockShapeHeight = 8; // 16 * 8 分成的块
const color = {
    black: 0,
    white: 255.
};
const currentColor = color.black;

const imgpath = path.resolve(__dirname, 'examplePic.jpeg');

imgData.getData(imgpath).then((res) => {
    let {
        R2d,
        G2d,
        B2d,
    } = res;
    const afterBlockData = [];
    [R2d, G2d, B2d].forEach((channelData, channelIndex) => {
        const channel = [];
        channelData.forEach((item, index) => {
            // item 行
            let line = [];
            item.forEach((val, ind) => {
                if (ind % blockShapeWidth === 0) {
                    line.push(currentColor)
                }
                line.push(val)
            });
            if (index % blockShapeHeight === 0) {
                let emptyLine = Array(line.length).fill(currentColor)
                channel.push(emptyLine);
            }
            channel.push(line)
        })
        afterBlockData.push(channel)
    })

    const currentHeight = afterBlockData[0].length;
    const currentWidth = afterBlockData[0][0].length;

    imgData.setData({
        R: afterBlockData[0],
        G: afterBlockData[1],
        B: afterBlockData[2],
        A: Array(currentWidth * currentHeight),
        width: currentWidth,
        height: currentHeight,
        outputPath: path.resolve(__dirname, 'shuchu')
    })
})
