/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /study/imooc-cli-dev/packages/core/bin/listCmd.js
 */
exports.command = "list";

exports.aliases = ["ls", "la", "ll"];

exports.describe = "List local packages";

exports.builder = (yargs) => {
  // listable.options(yargs);

  // return filterOptions(yargs);
};

exports.handler = function handler(argv) {
  console.log('[ argv ]', argv)
  // return require(".")(argv);
};