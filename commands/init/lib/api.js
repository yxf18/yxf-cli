const request = require('@uimooc-cli-dev/request');

exports.getProjectTemplate = () => request('project/template')