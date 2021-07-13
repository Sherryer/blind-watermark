const watermark = require('blind-watermark/lib/node')
// const watermark = require('./scripts/blind-watermark/lib/node')
const purl = 'https://bkimg.cdn.bcebos.com/pic/377adab44aed2e736d5390c38001a18b86d6faa3'

watermark.addWm({originImg: purl, wm:[true,true,false,false,true] , wmType: 'bool'}).then(val => {
    console.log(val);
})

