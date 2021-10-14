const mix = require('./mix');
const Worker = require('./mix.worker.js');

const createPromiseCallback = () => {
    let callback;
    let promise = new Promise((res) => {
        callback = (data) => {
            res(data)
        }
    });
    return [promise, callback]
};

const workerMix = (arg) => {
    let {
        heightChannel,
        lowChannel,
        type,
    } = arg;

    if (type ===  'node' || !window.Worker) {
        return mix(arg)
    }

    let returmPromiseList = [];

    lowChannel.forEach((channel, index) => {
        let worker = new Worker.default();
        let [promise, callback] = createPromiseCallback();
        returmPromiseList.push(promise);
        worker.postMessage({
            ...arg,
            lowChannel: [lowChannel[index]],
            heightChannel: [heightChannel[index]],
        });
        worker.onmessage = (event) => {
            callback(event.data[0])
        };
    });

    return Promise.all(returmPromiseList)
};

module.exports = workerMix;
