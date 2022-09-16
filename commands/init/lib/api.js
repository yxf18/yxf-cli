const request = require('@yxf-cli/request');

exports.getProjectTemplate = () => request('project/template')