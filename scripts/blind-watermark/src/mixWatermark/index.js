import mix from './mix'
import Worker from './mix.worker.js'

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
    if (!window.Worker) {
        return mix(arg)
    }

    let {
        heightChannel,
        lowChannel
    } = arg

    let [r, rCallback] = createPromiseCallback()
    let [g, gCallback] = createPromiseCallback()
    let [b, bCallback] = createPromiseCallback()

    let callBackList = [rCallback, gCallback, bCallback]

    lowChannel.forEach((channel, index) => {
        let worker = new Worker();
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

export default workerMix
