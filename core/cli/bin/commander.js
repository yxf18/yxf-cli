#! /usr/bin/env node

const commander = require('commander');
const pkg = require("../package.json");

// // 获取commander的单利
// const {
//     program
// } = commander;

// 手动实例化一个Command实例
const program = new commander.Command()
program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> <options>')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-e, --env <envName>', '获取环境变量名称');

// program.parse(process.argv)

// console.log('[ program.debug ]', program._optionValues.debug)
// // console.log('[ program.env ]', program._optionValues.env)
// // // program.outputHelp()
// // // program.opts()
// // console.log('%c [ program.opts() ]', program.opts())

// 注册命令的两种方式
// 1. command 
program
    .command('clone <source> [destination]', {
        isDefault: false
    })
    .description('clone a repository into a newly created directory')
    .option('-f,--force', '是否强制克隆')
    .action((source, destination, cmdObj) => {
        console.log('clone command called');
        console.log('[ source, destination ]', source, destination, cmdObj.force)
    });


// program
//     .command('start <service>', 'start named service')
//     .command('stop [service]', 'stop named service, or all if no name supplied');
// clone
//     .description('start clone')
//     .action(() => {
//         console.log( 'action -----> clone')
//     })

// 2. addCommand 向program增加配置好的子命令
const service = new commander.Command('service');
service
    .command('start [port]')
    .description('start service at some port')
    .action((port) => {
        console.log('start command called');
        console.log('[ port ]', port)
    })
service
    .command('stop [port]')
    .description('stop service at some port')
    .action((port) => {
        console.log('stop command called');
        console.log('[ port ]', port)
    })
// service.parse(process.argv)
program.addCommand(service)

program
    .command('install [name]', 'install package', {
        executableFile: 'imooc-cli',
        isDefault: false,
        hidden: true
    })
    .alias('i')

program
    .arguments('<cmd> [options]')
    .description('test command', {
        cmd: 'command to run',
        options: 'options for command'
    })
    .action((cmd, opts) => {
        console.log('[ cmd,opts ]', cmd, opts)
    })
// 高级定制1： 自定义help信息
// //method1
// program.helpInformation = function () {
//     return ''
// }
// // method2
// program.on('--help', function () {
//     console.log('[ your help info ]')
// })


// 高级定制2：实现debug模式
// program.on('option:debug', function () {
//     console.log('[ debug ]', program._optionValues.debug)
//     if (program._optionValues.debug) {
//         process.env.LOG_LEVEL = 'verbose'
//     }
//     console.log('[ process.env.LOG_LEVEL ]', process.env.LOG_LEVEL)
// })

// 高级定制3： 
program.on('command:*', function (obj) {
    console.log('[ obj ]', obj)
    console.error('未知命令' + obj[0])
    console.log('[ program.commands ]', program.commands[0].name())
    const avaiCommands = program.commands.map(cmd=>cmd.name())
    console.log('[ 可用命令 ]', avaiCommands)

})

program.parse(process.argv);