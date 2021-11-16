const WaterMark = require('./Watermark');

module.exports = {
    addWm: (...arg) => new WaterMark().addWm(...arg),
    extract: (...arg) => new WaterMark().extract(...arg)
};
