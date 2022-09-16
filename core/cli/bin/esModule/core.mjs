/*
 * @Author: yxf
 * @Description: In User Settings Edit
 * @FilePath: /imooc-cli-dev/core/cli/bin/test/core.mjs
 */
import path from 'path'
import {
    exists
} from './utils.mjs';

console.log('[ 1 ]', path.resolve('.'));
console.log('[ 2 ]', exists(path.resolve('.')));

(
    async function () {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('[ ok ]')
    } 
)();