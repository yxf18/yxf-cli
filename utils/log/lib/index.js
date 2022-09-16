'use strict';

// module.exports = index;
const log = require('npmlog')

module.exports = log;

log.level = process.env.LOG_LEVEL || 'info'; // 判断debug模式
log.heading = "yxf" //修改前缀
log.headingStyle = {
   fg: 'red',
   bg: 'white'
}
log.addLevel('success', 2000, {
   fg: 'green',
   bold: true
}) // 添加自定义指令

function index() {
   // log.warn('cli', 'test', 'asd')
   log.success('cli', 'test', 'asd')
   // log.verbose('cli', 'test', 'asd')

}