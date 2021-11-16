const WaterMark = require('./Watermark');
const imgData = require('./utilsNode/imgData');
const mixWatermark = require('./mixWatermark/index');

class NodeWaterMark extends WaterMark {
    constructor () {
        super();
        this.imgHandle = imgData;
        this.mixWatermark = (arg) => mixWatermark({...arg, type: 'node'})
    }
}

module.exports = {
    addWm: (...arg) => new NodeWaterMark().addWm(...arg),
    extract: (...arg) => new NodeWaterMark().extract(...arg)
};
