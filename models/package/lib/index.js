/*
 * @Author: yxf
 * @Description: npm Package类封装(用于下载更新npm包)
 * @FilePath: /imooc-cli-dev/models/package/lib/index.js
 */
'use strict';
const path = require('path');
const fse = require('fs-extra');
const formatPath = require('@umiooc-cli-dev/format-path');
const { isObject } = require('@umiooc-cli-dev/utils');
const npminstall = require('npminstall');
const userHome = require('user-home');
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require('@umiooc-cli-dev/get-npm-info');
const log = require('@umiooc-cli-dev/log');
// const pathExists = require('path-exists');
// import { pathExistsSync } from "path-exists"
let pathExists;
(async () => {
  const { pathExistsSync } = await import('path-exists');
  pathExists = pathExistsSync;
})();
const pkgDir = require('pkg-dir').sync;

class Package {
  constructor(options) {
    // log.verbose('package-constuctor', options)
    if (!options) {
      throw new Error('[Package->options]:  不能为空');
    }
    if (!isObject(options)) {
      throw new Error('[Package->options]: 类型必须为对象');
    }
    // package的目标路径
    this.targetPath = options.targetPath;
    // package的缓存路径
    this.storeDir = options.storeDir; // xxxx/node_modules/
    // package的name
    this.packageName = options.packageName;
    // package的version
    this.packageVersion = options.packageVersion;
    // Package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }
  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      log.verbose('[ storeDir目录不存在, fse自动创建ing..... ]');
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
    // log.verbose('[ this.packageVersion ]', this.packageVersion)
  }

  /**
   * @description: @imooc-cli/init 1.1.2 -> _@imooc-cli_init@1.1.2@@imooc-cli/init
   * @param {*}
   * @return {*}
   */
  get cacheFilePath() {
    const cachePath = path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
    return cachePath;
  }
  getSpecificCacheFilePath(packageVersion) {
    const cachePath = path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    );
    return cachePath;
  }
  // 判断当前package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      return pathExists(this.cacheFilePath); // /_@imooc-cli_init@1.1.2@@imooc-cli/init/
    } else {
      return pathExists(this.targetPath); // /dependenices/
    }
  }
  // 安装Package
  async install() {
    await this.prepare();

    npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    });
  }
  // 更新package
  async update() {
 
    await this.prepare();
    // 1. 获取最新版本号
    const latestPkgVersion = await getNpmLatestVersion(this.packageName);
    // 2. 查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPkgVersion);

    if (!pathExists(latestFilePath)) {
      // 3. 如果不存在，则直接安装最新版本
      npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          {
            name: this.packageName,
            version: latestPkgVersion,
          },
        ],
      });
      this.packageVersion = latestPkgVersion;
    }
  }
  // 获取本地代码入口文件路径
  getRootFilePath() {
  
    function _getRootFile(targetPath) {
      // 1. 获取package.json所在目录 - pkg-dir
      const pkgPath = pkgDir(targetPath);
      // log.verbose('[ pkgPath ]', pkgPath)
      if (pkgPath) {
        // 2. 读取package.json - require()
        const pkgFile = require(path.resolve(pkgPath, 'package.json'));
        // log.verbose('[ pkgFile ]', pkgFile)
        // 3. main/lib - path
        if (pkgFile?.main || pkgFile?.lib) {
          const entryPath = path.resolve(pkgPath, pkgFile.main);
          // log.verbose('[ entryPath ]', entryPath)
          // 4. 路径的兼容(macOS/windows)
          return formatPath(entryPath);
        }
      }
    }

    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }

    return null;
  }
}

module.exports = Package;
