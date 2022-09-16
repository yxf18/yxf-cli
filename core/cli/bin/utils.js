/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /imooc-cli-dev/core/cli/bin/utils.js
 */
const {
    pathExistsSync
} = require('path-exists');

export function exists(p) {
    return pathExistsSync(p)
}