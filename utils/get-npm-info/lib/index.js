'use strict';
const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');

function getNpmInfo(npmName, registry) {
  if (!npmName) return null;
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  // console.log('[ npmInfoUrl ]', npmInfoUrl)
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      } else {
        return null;
      }
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function getDefaultRegistry(isOriginal = false) {
  // body
  return isOriginal
    ? 'https://registry.npmjs.org/'
    : 'https://registry.npm.taobao.org/';
}
/**
 * @description: 获取npm所有版本
 * @param {*} npmName 包名
 * @param {*} registry 源
 * @return {*} versions
 */
async function getNpmVersion(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

/**
 * @description: 获取比基础版本高的所有版本
 * @param {*} baseVersion 基础版本
 * @param {*} versions 高出的版本
 * @return {*}
 */
function getSemverVersions(baseVersion, versions) {
  const sortVersions = versions
    .filter((vers) => semver.satisfies(vers, `^${baseVersion}`))
    .sort((a, b) => {
      return semver.gt(b, a) ? 1 : -1;
    });
  console.log('[ sortVersions ]', sortVersions);
  return sortVersions;
}

/**
 * @description: 获取最新版本号
 * @param {*} baseVersion 基础版本
 * @param {*} npmName 包名
 * @param {*} registry 源
 * @return {*} null | 最新版本号
 */
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersion(npmName, registry);
  // const newVersion = getSemverVersions(baseVersion, versions);
  const newVersion = getSemverVersions(baseVersion, versions);
  // console.log('[ newVersion ]', newVersion);
  if (newVersion && newVersion.length > 0) {
    return newVersion[0];
  }
  return null;
}

async function getNpmLatestVersion(npmName, registry) {
  const versions = await getNpmVersion(npmName, registry);
  if (versions) {
    const sortVersions = versions.sort((a, b) => {
      return semver.gt(b, a) ? 1 : -1;
    });
    // console.log('[ sortVersions ]', sortVersions);
    return sortVersions[0];
  }
}
getNpmLatestVersion('@imooc-cli/init')

module.exports = {
  getNpmInfo,
  getNpmVersion,
  getSemverVersions,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
};
