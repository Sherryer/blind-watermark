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

    let R = []
    let G = []
    let B = []
    let A = []

    let utilArr = [R, G, B, A]

    data.forEach((value, index) => {
        let location = index % 4
        let position = Math.floor(index / 4)

        let row = Math.floor(position / width)
        let rowIndex = position % width

        if (!utilArr[location][row]) {
            utilArr[location][row] = []
        }

        utilArr[location][row][rowIndex] = value
    })

    return {
        imgData,
        width,
        height,
        R,
        G,
        B,
        A,
    }
}

const setData = ({R, G, B, A = [], width, height}, downLoad, name = 'download') => {
    // r g b a 都为二维数组，需要展开
    let r = R.join(',').split(',')
    let g = G.join(',').split(',')
    let b = B.join(',').split(',')
    let a = A.join(',').split(',')

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
const getTwoEnds = (img) => {
    let {
        width,
        height,
        R,
        G,
        B,
        A,
    } = getData(img)

    let r = R.join(',').split(',')
    let g = G.join(',').split(',')
    let b = B.join(',').split(',')
    let a = A.join(',').split(',')

    let data = a.map((a, index) => {
        let gray = Math.max((r[index], g[index], b[index]))
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
