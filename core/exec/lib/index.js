/*
 * @Author: yxf
 * @Description: exec 动态引入执行命令
 * @FilePath: /imooc-cli-dev/core/exec/lib/index.js
 */
'use strict';
const path = require('path');
const cp = require('child_process');
const Package = require('@yxf-cli/package');
const log = require('@yxf-cli/log');

const SETTINGS = {
  init: '@yxf-cli/init',
};
const CACHE_DIR = 'dependenices/';

// windows操作系统spawn执行命令兼容
function spawn(command, args, options) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return cp.spawn(cmd, cmdArgs, options || {})
}

async function exec() {
  //   console.log('[ arguments ]', arguments)
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  const [cmdArgv, cmdOptions, cmdObj] = Array.from(arguments);
  log.verbose('[ targetPath ]', targetPath)
  log.verbose('[ homePath ]', homePath)
  let storeDir = '',
    pkg = '';

  const packageName = SETTINGS[cmdObj.name()]; // cmdObj.name()] init
  const packageVersion = 'latest';
  // const packageVersion = '1.0.4';
  // 是否执行本地代码
  if (!targetPath) {
    // N: 获取缓存目录
    targetPath = path.resolve(homePath, CACHE_DIR); //生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules'); //缓存目录
    log.verbose('[ targetPath ]', targetPath)
    log.verbose('[ storeDir ]', storeDir)
    // 初始化Package对象
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    // Package是否存在
    if (await pkg.exists()) {
      console.log('[ 更新 package ]');
      // Y: 更新Package
      await pkg.update();
    } else {
      console.log('[ 安装 package ]');
      // N: 安装Package
      await pkg.install();
    }
  } else {
    // 执行本地代码
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  // console.log('[ pkg.exists() ]', await pkg.exists())

  // 获取本地代码入口文件
  const rootFile = pkg.getRootFilePath();
  console.log('[ rootFile ]', rootFile);
  if (rootFile) {
    /* 
      // 在当前进程调用，无法充分应用CPU资源
      const cmd = require(rootFile);
      cmd.apply(null, arguments);
    */
    // 在node子进程中调用
    // console.log('[ arguments ]', arguments)
    try {
      const args = Array.from(arguments);
      const cmd = args[args.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) && !key.startsWith("_") && key !== 'parent') {
          o[key] = cmd[key]
        }
      })
      args[args.length - 1] = o;
      // console.log('[ args ]', args)
      // 生成指令执行代码
      const code = `require('${rootFile}').call(null,${JSON.stringify(args)})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      // 执行产生异常时，打印异常并终止执行
      child.on('error', e => {
        log.error(e.message);
        process.exit(1)
      })
      // 执行完毕 正常退出
      child.on('exit', e => {
        log.verbose('命令执行成功:' + e);
        process.exit(e)
      })
    } catch (error) {
      log.error(error.message)
    }
  }

  // console.log('[ pkg ]', pkg)
  // console.log('[ pkg.getRootFilePath() ]', pkg.getRootFilePath()) //获取本地代码入口文件

  // console.log('[ exec ]', process.env.CLI_TARGET_PATH)
  // console.log('[ exec ]', process.env.CLI_HOME_PATH)
}

module.exports = exec;
