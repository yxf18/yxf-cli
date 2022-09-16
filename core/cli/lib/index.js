/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /yxf-cli/core/cli/lib/index.js
 */
'use strict';
const path = require('path');
const semver = require('semver'); // 版本比对
const colors = require('colors/safe'); // 终端带色文本
const userHome = require('user-home'); // 用户主目录
const pathExistsSync = require('path-exists').sync; // 检查路径是否存在
const log = require("@yxf-cli/log"); //
// const init = require('@yxf-cli/init'); // init命令
const exec = require('@yxf-cli/exec'); // 动态加载执行文件
const constant = require('./const') //
const pkg = require("../package.json");
const {
    program
} = require('commander');

let args, config;

module.exports = core;

// require: .js/.json/.node
// .js -> module.exports/exports
// .json -> JSON.parse
// any -> 默认通过js引擎解析

async function core(val) {
    // TODO: coding
    try {
        // checkPkgVersion()
        // checkNodeVersion()
        // checkRoot()
        // checkUserHome()
        // // checkInputArgs()
        // log.verbose('debug', 'test debug log')
        // checkEnv()
        // await checkGlobalUpdate()


        await prepare(); // 脚手架启动
        registerCommand() // 命令注册
    } catch (error) {
        log.error(error.message)
        if (process.env.LOG_LEVEL === "verbose") {
            console.log('[ e ]', error)
        }
    }
}
async function prepare() {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    // checkInputArgs()
    // log.verbose('debug', 'test debug log')
    checkEnv()
    await checkGlobalUpdate()
}
/* ------- */
// 注册指令
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<command> [options]')
        .version(pkg.version)
        .option('-d,--debug', '是否开启调试模式', false)
        .option('-tp,--targetPath <targetPath>', '是否指定本地调试路径', '');

    // 增加命令
    program 
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化项目')
        // .action(init)
        .action(exec)


    // debug
    program.on('option:debug', () => {
        const isDebug = program.opts().debug;
        if (isDebug) {
            process.env.LOG_LEVEL = 'verbose'
        } else {
            process.env.LOG_LEVEL = 'info'
        }
        log.level = process.env.LOG_LEVEL
        // log.verbose('test debug')
    })

    // 指定targetPath
    program.on('option:targetPath', (tp) => {
        // console.log('[ tp ]', tp)
        process.env.CLI_TARGET_PATH = tp
    })


    program.on('command:*', (obj) => {
        // console.log(colors.red('未知命令' + obj[0]))
        const avaiCommands = program.commands.map(cmd => cmd.name())
        // console.log(colors.green('[ 可用命令 ]', avaiCommands))
    })



    program.parse(process.argv);
    // console.log('[ program.args ]', program.args)
    if (program.args && program.args.length < 1) {
        program.outputHelp();
    }
}

/* ------- */

// 1. 检查版本号
function checkPkgVersion() {
    // console.log(`version: ${pkg.version}`)
    // log()
    // log.success(`1. 检查版本号: ${pkg.version}`)
}

// 2. 检查node版本
function checkNodeVersion() {
    // 1. 获取当前版本号
    const currentVersion = process.version;
    // 2. 比对最低版本号
    // log.success(`node version: ${process.version}`)
    const lowestVersion = constant.LOWEST_NODE_VERSION;
    // console.log('[ !semver.gte(currentVersion, lowestVersion) ]', !semver.gte(currentVersion, lowestVersion))
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`imooc-cli 需要安装 ${lowestVersion}以上的版本`))
    } else {
        // log.success(`2. 检查node版本: ${currentVersion}`)
    }
}

// 3. 检查root账户
function checkRoot(params) {
    const rootCheck = require('root-check');
    rootCheck()
    // console.log('[ process ] >', process)
    // console.log(process.geteuid())
    // log.success(`3. 检查root账户: ${process.geteuid()}`)
}

// 4. 检查主目录
function checkUserHome() {
    if (!userHome || !pathExistsSync(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在'))
    } else {
        log.success(`4. 检查主目录: ${userHome}`)
    }
}

// 5. 检查入参
function checkInputArgs() {
    const minimist = require('minimist') // 参数解析
    args = minimist(process.argv.slice(2))
    // console.log('[ process.argv ]', process.argv)
    // log.success(`5. 检查入参: ${JSON.stringify(args)}`)
    checkArgs()
}

// 5.1 检查参数
function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

// 6. 检查环境变量
function checkEnv() {
    const dotenv = require('dotenv');
    const dotenvPath = path.resolve(userHome, '.env');
    if (pathExistsSync(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }
    // const config = createDefaultConfig()
    createDefaultConfig()
    // log.success(`6. 检查环境变量: ${JSON.stringify(config)}`)
    // log.success(`6. 检查环境变量: ${process.env.CLI_HOME_PATH}`)
}

// 6.1 创建默认环境变量
function createDefaultConfig() {
    const cliConfig = {
        // home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
    // return cliConfig
}

// 7. 检查是否最新版本
async function checkGlobalUpdate() {
    // 1. 获取当前版本号和模块名
    const currentVersion = pkg.version;
    const npmName = pkg.name;
    // console.log('[ currentVersion ]', currentVersion)
    // console.log('[ npmName ]', npmName)
    // 2. 调用npm API，获取所有版本号
    const {
        getNpmSemverVersion
    } = require('@yxf-cli/get-npm-info');
    const latestVersion = await getNpmSemverVersion(currentVersion, npmName)
    // console.log('[ latestVersion ]', latestVersion)
    if (latestVersion && semver.gt(latestVersion, currentVersion)) {
        log.warn(colors.yellow('更新提示', `请手动更新 ${npmName},当前版本:${currentVersion}，最新版本${latestVersion}
        更新命令： npm install -g ${npmName}
        `))
    }
    // 3. 提取所有版本号比对那些版本号是大于当前版本号
    // 4. 获取最新的版本号，提示用户更新
}