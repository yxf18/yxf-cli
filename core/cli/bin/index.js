#! /usr/bin/env node

const importLocal = require('import-local');
// console.log('__filename', __filename)
// console.log('[ importLocal(__filename) ]', importLocal(__filename))
// 本地开发时，希望使用本地cli版本
if (importLocal(__filename)) {
    require('npmlog').info('cli', '正在使用uimooc-cli 本地版本')
} else {
    require('../lib/index.js')(process.argv.slice(2))
}