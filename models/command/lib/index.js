/*
 * @Author: yxf
 * @Description: 脚手架命令基类
 * @FilePath: /imooc-cli-dev/models/command/lib/index.js
 */
'use strict';
const semver = require('semver');
const colors = require('colors/safe')
const log = require('@yxf-cli/log');

const LOWEST_NODE_VERSION = '12.0.0'

class Command {
    constructor(argv) {
        this._argv = argv;
        if (!argv) {
            throw new Error('参数不能为空')
        }
        if (!Array.isArray(argv)) {
            throw new Error('参数必须为数组')
        }
        if (argv.length < 1) {
            throw new Error('参数列表为空')
        }
        let runner = new Promise((resove, reject) => {
            let chain = Promise.resolve();
            // 检查node版本
            chain = chain.then(() => {
                this.checkNodeVersion()
            })
            // 初始化参数
            chain = chain.then(() => this.initArgs());
            // init业务逻辑
            chain = chain.then(() => this.init());
            // 执行
            chain = chain.then(() => this.exec());

            chain.catch(err => {
                log.error(err.message)
            })
        })
    }

    // 交给子类去实现
    init() {
        throw new Error('init 必须实现')
    }

    // 交给子类去实现
    exec() {
        throw new Error('exec 必须实现')
    }

    // 初始化参数
    initArgs() {
        // this._cmd = this._argv[this._argv.length - 1]
        // this._argv = this._argv.slice(0, this._argv.length - 1)
        this._cmdArgv = this._argv[0];
        this._cmdOptions = this._argv[1];
        this._cmdObj = this._argv[2];
    }

    // 检查node版本
    checkNodeVersion() {
        const currentVersion = process.version
        const lowestVersion = LOWEST_NODE_VERSION
        if (!semver.gte(currentVersion, lowestVersion)) {
            throw new Error(colors.red(`yxf-cli 需要安装${lowestVersion}版本及以上的Node.js`))
        }
    }
}

module.exports = Command;