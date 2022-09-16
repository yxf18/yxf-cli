#! /usr/bin/env node

console.log('[  ] >', 999999)
const yargs = require('yargs/yargs'); // https://www.npmjs.com/package/yargs
const dedent = require('dedent')
const {
    hideBin
} = require('yargs/helpers');
// console.log('[ hideBin->process.argv ]', hideBin(process.argv))
// const arg = hideBin(process.argv);
const cli = yargs();
/**
 * 注意：hideBin是 . 的简写process.argv.slice(2)。它的好处是它考虑了某些环境中的变化，例如Electron。
 *  */ 
const argv = process.argv.slice(2);
const listCmd = require("./listCmd");
const pkg = require("../package.json");
const context = {
    lernaVersion: pkg.version,
};

cli
    .usage("Usage: $0 <command> [options]")
    .demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
    .strict() // 严格模式
    .recommendCommands() // 会根据当前输入的command去找最相似的进行提示
    .fail((err, msg) => {
        console.log('err:',err)
    }) // 错误回调
    .alias('h', 'help')
    .alias('v', 'version') // 别名
    .wrap(cli.terminalWidth()) // 修改宽度
    .epilogue(dedent `1111
    22222
    333
    `) // 尾部信息 (dedent库 去除每行顶部空格，方便多行字符串的输出 )
    .options({
        debug: {
            type: 'boolean',
            describe: 'bootstrap debug mode',
            alias: 'd'
        }
    }) //多命令
    .option('ci', {
        type: 'boolean',
        describe: 'ci    describe',
        // hidden: true
    }) //单命令
    .group(['debug'], 'Dev Options:') //组合
    .group(['registry'], 'Extra Options:') //组合
    .command('init [name]', 'Do init a project', (yargs) => {
        yargs
            .option('name', {
                type: 'string',
                describe: 'Name of a project',
                alias: 'n'
            })
    }, (argv) => {
        console.log('[ argv ]', argv)
    })
    .command(listCmd)
    .parse(argv, context);


/**
     * yargs(hideBin(process.argv))
  .command('serve [port]', 'start the server', (yargs) => {
    return yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      })
  }, (argv) => {
    if (argv.verbose) console.info(`start server on :${argv.port}`)
    serve(argv.port)
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse() 
  */