/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /imooc-cli-dev/core/cli/bin/test/utils.mjs
 */
// const {
//     pathExistsSync
// } = require('path-exists');
import {
    pathExistsSync
} from "path-exists"

export function exists(p) {
    return pathExistsSync(p)
}