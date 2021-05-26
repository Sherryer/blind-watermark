const flat = (arr) => {
    if (!arr) { return [] }
    return Promise.resolve(arr.flat())
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
}

const spreadArr = (arr) => {
    let result = []
    arr.forEach(item => result = [...result, item])
}

const getCanvasDom = () => {
    let id = 'sherry-chris-b-wm-g-i-c-c'
    let canvas = document.getElementById(id)
    if (!canvas) {
        let dom = document.createElement('canvas')
        dom.style.opacity = 0
        dom.style.position = 'absolute'
        dom.style.left = '-999999px'
        dom.id = id
        document.body.appendChild(dom)
        canvas = dom
    }
    return canvas
}

const getData = (img) => {
    if (img instanceof FileList) {
        img = img[0]
    }
    if (!(img instanceof File && img.type.includes('image'))) {
        return Promise.resolve(getDataByDom(img))
    }
    return new Promise((res) => {
        const imgDom = new Image();
        imgDom.onload = function(){
            res(getDataByDom(imgDom))
        }
        imgDom.src = window.URL.createObjectURL(img)
    })
}

const getDataByDom = (img) => {
    if (!(img.tagName?.toLowerCase() === 'img')) {
        console.error('未传入图片dom', img)
        return
    }

    if (img.width === 0 || img.height === 0) {
        console.error('请输入有效图片')
        return
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
    } = imgData

    let R2d = []
    let G2d = []
    let B2d = []
    let A2d = []

    let R1d = []
    let G1d = []
    let B1d = []
    let A1d = []

    let utilArr = [R2d, G2d, B2d, A2d]
    let util1dArr = [R1d, G1d, B1d, A1d]

    data.forEach((value, index) => {
        let location = index % 4
        let position = Math.floor(index / 4)

        let row = Math.floor(position / width)
        let rowIndex = position % width

        if (!utilArr[location][row]) {
            utilArr[location][row] = []
        }

        util1dArr[location][position]  = value

        utilArr[location][row][rowIndex] = value
    })

    return {
        imgData,
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
}

const setData = async ({R, G, B, A = [], width, height}, downLoad, name = 'download') => {
    // r g b 支持 1 维或 2 维数组 a 只支持 1 维数组
    // 数据较大时 2 维转 1 维耗时较高，可能带来住线程阻塞，三通道均改为异步
    let r = await flat(R)
    let g = await flat(G)
    let b = await flat(B)
    let a = A

    let canvas = getCanvasDom();
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let insertImgData = ctx.createImageData(width, height);

    for (let index = 0; index < r.length; index++) {
        let realIndex = index * 4
        insertImgData.data[realIndex] = r[index]
        insertImgData.data[realIndex + 1] = g[index]
        insertImgData.data[realIndex + 2] = b[index]
        insertImgData.data[realIndex + 3] = a[index] || 255
    }

    ctx.putImageData(insertImgData, 0, 0)

    if (downLoad) {
        let a = document.createElement("a");
        a.href = canvas.toDataURL()
        a.download = name;
        setTimeout(function () {
            window.URL.revokeObjectURL(a.href);
        }, 4e4);
        setTimeout(function () {
            click(a);
        }, 0);
    }
}

// 二值化，算法比较简单，适用于简单黑白图。不考虑透明度
const getTwoEnds = async (img) => {
    let {
        width,
        height,
        R1d,
        G1d,
        B1d,
        A1d,
    } = await getData(img)

    let data = A1d.map((a, index) => {
        let gray = Math.max((R1d[index], G1d[index], B1d[index]))
        return gray > 127.5  // true  代表白 false 代表黑
    })

    return {
        width,
        height,
        data,
    }
}

const setTwoEnds = ({data, width, height}, name) => {
    let numList = data.map((val) => val * 255)
    setData({
        R: numList,
        G: numList,
        B: numList,
        width,
        height
    }, true, name)

}

export default {
    getData,
    setData,
    getTwoEnds,
    setTwoEnds,
}
