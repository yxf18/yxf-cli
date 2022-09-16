'use strict';


function isObject(object) {
    return Object.prototype.toString.call(object) === '[object Object]'
}

function spinnerStart(msg = "loading", setSpinnerString = '|/-\\') {
    const { Spinner } = require('cli-spinner');
    const spinner = new Spinner(`${msg} %s`);
    spinner.setSpinnerString(setSpinnerString);
    spinner.start();
    return spinner;
}

const sleep = async (delay = 500) => {
    // 方法1
    // let t = Date.now();
    // while (Date.now() - t < delay) {
    //     continue
    // }

    // 方法2
    return new Promise((rs) => setTimeout(rs, delay))
}

module.exports = {
    isObject,
    spinnerStart,
    sleep
};
