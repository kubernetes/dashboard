// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Helper function that spawns a go binary process.
 */
import child from 'child_process';
import lodash from 'lodash';
import q from 'q';
import semver from 'semver';

import conf from './conf';

// Add base directory to the gopath so that local imports work.
const sourceGopath = `${conf.paths.backendTmp}`;
// Add the project's required go tools to the PATH.
const devPath = `${process.env.PATH}:${conf.paths.goTools}/bin`;

/**
 * The environment needed for the execution of any go command.
 */
const env = lodash.merge(process.env, {GOPATH: sourceGopath, PATH: devPath});

/**
 * Minimum required Go Version
 */
const minGoVersion = '1.5.0';

/**
 * Spawns a Go process wrapped with the Godep command after making sure all GO prerequisites are
 * present. Backend source files must be packaged with 'package-backend-source' task before running
 * this command.
 *
 * @param {!Array<string>} args - Arguments of the go command.
 * @param {function(?Error=)} doneFn - Callback.
 */
export default function spawnGoProcess(args, doneFn) {
  checkPrerequisites().then(() => spawnProcess(args)).then(doneFn).fail((error) => doneFn(error));
}

/**
 * Checks if all prerequisites for a go-command execution are present.
 * @return {Q.Promise} A promise object.
 */
function checkPrerequisites() {
  return checkGo().then(checkGoVersion).then(checkGodep);
}

/**
 * Checks if go is on the PATH prior to a go command execution, promises an error otherwise.
 * @return {Q.Promise} A promise object.
 */
function checkGo() {
  let deferred = q.defer();
  child.exec(
      'which go',
      {
        env: env,
      },
      function(error, stdout, stderror) {
        if (error || stderror || !stdout) {
          deferred.reject(
              new Error(
                  'Go is not on the path. Please pass the PATH variable when you run ' +
                  'the gulp task with "PATH=$PATH" or install go if you have not yet.'));
          return;
        }
        deferred.resolve();
      });
  return deferred.promise;
}

/**
 * Checks if go version fulfills the minimum version prerequisite, promises an error otherwise.
 * @return {Q.Promise} A promise object.
 */
function checkGoVersion() {
  let deferred = q.defer();
  child.exec(
      'go version',
      {
        env: env,
      },
      function(error, stdout) {
        let match = /[\d\.]+/.exec(stdout.toString());  // matches version number
        if (match.length < 1) {
          deferred.reject(new Error('Go version not found.'));
          return;
        }
        if (semver.lt(match[0], minGoVersion)) {
          deferred.reject(
              new Error(
                  `The current go version "${match[0]}" is older than ` +
                  `the minimum required version "${minGoVersion}". ` +
                  `Please upgrade your go version!`));
          return;
        }
        deferred.resolve();
      });

  return deferred.promise;
}

/**
 * Checks if godep is on the PATH prior to a go command execution, promises an error otherwise.
 * @return {Q.Promise} A promise object.
 */
function checkGodep() {
  let deferred = q.defer();
  child.exec(
      'which godep',
      {
        env: env,
      },
      function(error, stdout, stderror) {
        if (error || stderror || !stdout) {
          deferred.reject(
              new Error(
                  'Godep is not on the path. ' +
                  'Please run "npm install" in the base directory of the project.'));
          return;
        }
        deferred.resolve();
      });
  return deferred.promise;
}

/**
 * Spawns Go process wrapped with the Godep command.
 * Promises an error if the go command process fails.
 *
 * @param {!Array<string>} args - Arguments of the go command.
 * @return {Q.Promise} A promise object.
 */
function spawnProcess(args) {
  let deferred = q.defer();
  let goTask = child.spawn('godep', ['go'].concat(args), {
    env: env,
    stdio: 'inherit',
  });
  // Call Gulp callback on task exit. This has to be done to make Gulp dependency management
  // work.
  goTask.on('exit', function(code) {
    if (code !== 0) {
      deferred.reject(Error(`Go command error, code: ${code}`));
      return;
    }
    deferred.resolve();
  });
  return deferred.promise;
}
