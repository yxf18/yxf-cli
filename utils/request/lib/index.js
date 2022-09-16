'use strict';
const axios = require('axios');

const { YXF_CLI_REQUEST_BASE_URL } = process.env;

const request = axios.create({
    baseURL: YXF_CLI_REQUEST_BASE_URL || 'http://cli.yxf.zone:7001/api/',
    timeout: 60 * 1000,
})

request.interceptors.request.use(config => {
    return config
})

request.interceptors.response.use(response => {
    return response.data
}, error => {
    return Promise.reject(error)
})

module.exports = request;
