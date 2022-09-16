/*
 * @Author: yxf
 * @Description: cmomand init
 * @FilePath: /imooc-cli-dev/commands/init/lib/index.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsExtra = require('fs-extra');
const semver = require('semver');
const userHome = require('user-home');
const log = require('@uimooc-cli-dev/log');
const Command = require("@uimooc-cli-dev/command");
const Package = require("@uimooc-cli-dev/package");
const { spinnerStart, sleep } = require('@uimooc-cli-dev/utils');
const { getProjectTemplate } = require('./api');

const TYPE_PROJECT = "project";
const TYPE_COMPONENT = "component";

class initCommand extends Command {
    init() {
        this.projectName = this._cmdArgv;
        this.force = !!this._cmdOptions.force;
        this.projectInfo = {};
        this.template = [];
        log.verbose('projectName', this.projectName);
        log.verbose('force', this.force);
    }

    async exec() {
        try {
            // 0. 判断项目模板是否存在
            const template = await getProjectTemplate();
            if (!template || template.length === 0) {
                throw new Error('项目模板不存在!')
            }
            this.template = template;
            // 1. 准备阶段
            const projectInfo = await this.prepare();
            log.verbose('[ projectInfo ]', projectInfo);
            if (projectInfo) {
                this.projectInfo = projectInfo;
                // 2. 下载模板
                await this.downloadTemplate()
                // 3. 安装模板
                await this.installTemplate()
            }
        } catch (e) {
            log.error(e.message)
        }
    }

    async prepare() {
        const localPath = process.cwd();
        // 判断当前目录是否为空
        if (!this.isCwdEmpty(localPath)) {
            // 询问是否继续创建 使用到inquirer这个库
            // 如果 用户不是强制更新，那么就要询问用户是否继续创建
            let ifContinue = false;
            if (!this.force) {
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: '当前目录不为空，是否继续创建？'
                })).ifContinue;
            }
            // 不管用户是否是强制更新，最后都会展示这次询问，因为清空当前目录文件是一个非常严谨的操作
            if (ifContinue || this.force) {
                // 做二次确认
                const { confirmDelete } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDelete',
                    message: '是否确认清空当前目录下的文件？',
                    default: false
                })
                console.log('[ confirmDelete ]', confirmDelete)
                if (confirmDelete) {
                    // 清空当前目录 使用 fs-extra
                    fsExtra.emptyDirSync(localPath)
                }
                // 获取项目基本信息
                return this.getProjectInfo()
            } else {
                process.exit()
            }
        } else {
            // 获取项目基本信息
            return this.getProjectInfo()
        }

    }

    isCwdEmpty(path) {
        let fileList = fs.readdirSync(path);
        // 过滤 .xx和node_modules 文件
        fileList = fileList.filter(file => (
            !file.startsWith('.') && !['node_modules'].includes(file)
        ))
        return !fileList || fileList.length <= 0
    }

    async getProjectInfo() {
        // 声明一个对象用来接收项目信息 最后返回的也是这个对象
        let projectInfo = {}

        // 校验项目名称的正则，封装在一个函数内
        function isValidName(v) {
            return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v)
        }

        // 1. 选择创建项目或者组件
        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                { name: '项目', value: TYPE_PROJECT },
                { name: '组件', value: TYPE_COMPONENT }
            ]
        })
        log.verbose('[ type ]', type)
        const title = type === TYPE_PROJECT ? '项目' : '组件'
        // 兼容项目和模板两种情况的交互询问
        const projectNamePrompt = [
            {
                type: 'input',
                name: 'projectName',
                message: `请输入${title}名称`,
                default: '',
                validate: function (v) {
                    const done = this.async()
                    // 1.首字符必须为英文字符
                    // 2.尾字符必须为英文字符或数字，不能为字符
                    // 3.字符仅允许“-_”
                    // 4.兼容只有一个字母的情况
                    setTimeout(function () {
                        if (!isValidName(v)) {
                            done(`请输入合法的${title}名称,例：a1 | a-b-c | a1-b1-c1`)
                            return
                        }
                        // Pass the return value in the done callback
                        done(null, true)
                    }, 0)
                },
                filter: function (v) {
                    return v
                }
            },
            {
                type: 'input',
                name: 'projectVersion',
                message: `请输入${title}版本号`,
                default: '1.0.0',
                validate: function (v) {
                    const done = this.async()
                    setTimeout(() => {
                        if (!semver.valid(v)) {
                            return done(`请输入合法的版本号`)
                        }
                        done(null, true)
                    })
                },
                filter: (v) => {
                    if (!!semver.valid(v)) {
                        return semver.valid(v)
                    }

                    return v
                }
            },
            {
                type: 'list',
                name: 'projectTemplate',
                message: '请选择项目模板',
                choices: this.template // [{name:'vue2标准模板',value:'yxf-cli-template-vue2'},...]
            }
        ]
        // 2. 获取项目的基本信息
        if (type === TYPE_PROJECT) {

            const project = await inquirer.prompt(projectNamePrompt);
            projectInfo = {
                type,
                ...project
            }
        } else if (type === TYPE_COMPONENT) {

        }
        // 3. return 项目基本信息
        return projectInfo
    }

    async downloadTemplate() {
        const { projectTemplate } = this.projectInfo;
        const templateInfo = this.template.find(npm => npm.value === projectTemplate);
        const targetPath = path.resolve(userHome, ".imooc-cli-dev", 'template');
        const storeDir = path.resolve(targetPath, 'node_modules');
        const { value, version } = templateInfo;
        // console.log('[ templateInfo ]', templateInfo)
        const templateNpm = new Package({
            targetPath,
            storeDir,
            packageName: value,
            packageVersion: version
        })
        log.verbose('templateNpm', templateNpm);
        if (! await templateNpm.exists()) {
            const spinner = spinnerStart('正在下载模板...');
            await sleep()
            try {
                await templateNpm.install();
                log.success('下载模板成功')
            } catch (e) {
                throw new Error(e);
            } finally {
                spinner.stop(true);
            }
        } else {
            const spinner = spinnerStart('正在更新模板...');
            await sleep()
            try {
                await templateNpm.update();
                log.success('更新模板成功')
            } catch (e) {
                throw new Error(e);
            } finally {
                spinner.stop(true);
            }
        }
        // const targetPath = ;
        // const storeDir = ;
        // 1. 通过项目模板API获取项目模板信息
        // 1.1 通过egg.js 搭建一套后端系统
        // 1.2 通过npm存储项目模板
        // 1.3 将项目模板信息存储到MongoDB数据库中
        // 1.4 通过egg.js获取MongoDB中的数据并且通过API返回
    }

    async installTemplate() {

    }
}

function init(argv) {
    return new initCommand(argv)
}

module.exports = init;
module.exports.initCommand = initCommand;