// const mix = require('./mixWm');
const mix = require('./mixWmWasm');

onmessage = function (event) {
    let arg = event.data;
    mix(arg).then((res) => {
        postMessage(res)
    })
};

module.exports = onmessage;
