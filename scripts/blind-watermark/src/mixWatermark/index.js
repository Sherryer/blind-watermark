const mix = require('./mix')
const Worker = require('./mix.worker.js')

const createPromiseCallback = () => {
    let callback
    let promise = new Promise((res, rej) => {
        callback = (data) => {
            res(data)
        }
    })
    return [promise, callback]
}

const workerMix = (arg) => {
    let {
        heightChannel,
        lowChannel,
        type
    } = arg

    if (type ===  'node' || !window.Worker) {
        return mix(arg)
    }

    let [r, rCallback] = createPromiseCallback()
    let [g, gCallback] = createPromiseCallback()
    let [b, bCallback] = createPromiseCallback()

    let callBackList = [rCallback, gCallback, bCallback]

    lowChannel.forEach((channel, index) => {
        let worker = new Worker.default();
        worker.postMessage({
            ...arg,
            lowChannel: [lowChannel[index]],
            heightChannel: [heightChannel[index]],
        });
        worker.onmessage = (event) => {
            callBackList[index](event.data[0])
        };
    })

    return Promise.all([r, g, b])
}

module.exports = workerMix
