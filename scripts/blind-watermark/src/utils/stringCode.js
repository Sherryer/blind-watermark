const againGroup = require('./againGroup')

const str2charCode = (str) => str.split('').map(val => val.charCodeAt().toString(2).padStart(16, '0')).join('')

const charCode2str = (code) => againGroup(code, 16).map(val => String.fromCharCode(parseInt(val, 2))).join('')

module.exports = {
    str2charCode,
    charCode2str,
}
