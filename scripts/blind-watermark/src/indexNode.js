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

let bwm = new NodeWaterMark();

module.exports = bwm;
