const mix = require('./mix')

onmessage = function (event) {
    let arg = event.data;
    mix(arg).then((res) => {
        postMessage(res)
    })
};

module.exports = onmessage
