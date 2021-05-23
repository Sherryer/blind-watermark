import mix from './mix'

onmessage = function (event) {
    let arg = event.data;
    mix(arg).then((res) => {
        postMessage(res)
    })
};

export default onmessage
