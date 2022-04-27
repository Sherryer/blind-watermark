// web img handle

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

function dataURLToFile(dataurl, name = '') {
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
}

const click = (node) => {
    try {
        node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
        let evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(
            "click",
            true,
            true,
            window,
            0,
            0,
            0,
            80,
            20,
            false,
            false,
            false,
            false,
            0,
            null
        );
        node.dispatchEvent(evt);
    }
};

const getCanvasDom = () => {
    let dom = document.createElement('canvas');
    dom.style.opacity = '0';
    dom.style.top = '0';
    dom.style.position = 'absolute';
    dom.style.left = '-999999px';
    document.body.appendChild(dom);
    return dom
};

const getData = (img, readOriginImg) => {
    if (img instanceof FileList) {
        img = img[0]
    }
    if (!(img instanceof File && img.type.includes('image'))) {
        return Promise.resolve(getDataByDom(img, readOriginImg))
    }
    return new Promise((res) => {
        const imgDom = new Image();
        imgDom.onload = function(){
            res(getDataByDom(imgDom, readOriginImg))
        };
        imgDom.src = window.URL.createObjectURL(img)
    })
};

const getDataByDom = (img, readOriginImg) => {
    if (!(img.tagName && img.tagName.toLowerCase() === 'img')) {
        return Promise.reject('未传入图片dom')
    }

    if (img.width === 0 || img.height === 0) {
        return Promise.reject('请输入宽高不为0的有效图片')
    }

    let canvas = getCanvasDom();

    canvas.width = img.width;
    canvas.height = img.height;

    let context = canvas.getContext("2d");

    context.drawImage(img, 0, 0);

    // 获取像素数据
    let imgData = context.getImageData(0, 0, img.width, img.height);

    let {
        data,
        width,
        height
    } = imgData;

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
        if (readOriginImg && location !== 3) {
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

    canvas.outerHTML = '';

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

const setData = async ({R, G, B, A = [], width, height, download = true, name = 'download'}) => {
    // r g b 支持 1 维或 2 维数组 a 只支持 1 维数组
    // 数据较大时 2 维转 1 维耗时较高，可能带来住线程阻塞，三通道均改为异步
    let r = await flat(R);
    let g = await flat(G);
    let b = await flat(B);
    let a = A;

    let canvas = getCanvasDom();
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let insertImgData = ctx.createImageData(width, height);

    for (let index = 0; index < a.length; index++) {
        let realIndex = index * 4;
        let pixR = Math.round(r[index]) || 0;
        let pixG = Math.round(g[index]) || 0;
        let pixB = Math.round(b[index]) || 0;
        let pixA = Math.round(a[index]) || 255;
        insertImgData.data[realIndex] = formatPixel(pixR);
        insertImgData.data[realIndex + 1] = formatPixel(pixG);
        insertImgData.data[realIndex + 2] = formatPixel(pixB);
        insertImgData.data[realIndex + 3] = formatPixel(pixA);
    }

    ctx.putImageData(insertImgData, 0, 0);

    let dataUrl = canvas.toDataURL();
    if (download) {
        let a = document.createElement("a");
        a.href = dataUrl;
        a.download = name;
        setTimeout(function () {
            window.URL.revokeObjectURL(a.href);
        }, 4e4);
        setTimeout(function () {
            click(a);
        }, 0);
    }
    canvas.outerHTML = '';
    return {
        File: dataURLToFile(dataUrl, name),
        base64: dataUrl,
    }
};

// 二值化，算法比较简单，适用于简单黑白图。不考虑透明度
const getTwoEnds = async (img) => {
    let {
        width,
        height,
        R1d,
        G1d,
        B1d,
        A1d,
    } = await getData(img);

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

const setTwoEnds = ({data, width, height, name}) => {
    let numList = data.map((val) => val * 255);
    setData({
        R: numList,
        G: numList,
        B: numList,
        A: [...numList].fill(255),
        width,
        height,
        download: true,
        name
    })

};

module.exports = {
    getData,
    setData,
    getTwoEnds,
    setTwoEnds,
};
