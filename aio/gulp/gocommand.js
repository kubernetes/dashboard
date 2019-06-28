// Copyright 2017 The Kubernetes Authors.
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

// Add the project's required go tools to the PATH.
const devPath = `${process.env.PATH}:${conf.paths.goTools}/bin`;

/**
 * The environment needed for the execution of any go command.
 */
const env = lodash.merge(process.env, {PATH: devPath});

/**
 * Minimum required Go Version
 */
const minGoVersion = '1.12.6';

/**
 * Spawns a Go process after making sure all Go prerequisites are
 * present. Backend source files must be packaged with 'package-backend'
 * task before running
 * this command.
 *
 * @param {!Array<string>} args - Arguments of the go command.
 * @param {function(?Error=)} doneFn - Callback.
 * @param {!Object<string, string>=} [envOverride] optional environment variables overrides map.
 */
export default function goCommand(args, doneFn, envOverride) {
  checkPrerequisites()
      .then(() => spawnGoProcess(args, envOverride))
      .then(doneFn)
      .fail((error) => doneFn(error));
}

/**
 * Checks if all prerequisites for a go-command execution are present.
 * @return {Q.Promise} A promise object.
 */
function checkPrerequisites() {
  return checkGo().then(checkGoVersion);
}

/**
 * Checks if go is on the PATH prior to a go command execution, promises an error otherwise.
 * @return {Q.Promise} A promise object.
 */
function checkGo() {
  let deferred = q.defer();
  child.exec(
      'which go', {
        env: env,
      },
      function(error, stdout, stderror) {
        if (error || stderror || !stdout) {
          deferred.reject(new Error(
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
      'go version', {
        env: env,
      },
      function(error, stdout) {
        let match = /go version devel/.exec(stdout.toString());
        if (match && match.length > 0) {
          // If running a development version of Go we assume the version to be
          // good enough, if compilation gives weird errors the developer also
          // should know what is going on, since he uses a development version
          // of Go :)
          deferred.resolve();
          return;
        }
        match = /[\d.]+/.exec(stdout.toString());  // matches version number
        if (match && match.length < 1) {
          deferred.reject(new Error('Go version not found.'));
          return;
        }
        let currentGoVersion = match[0];
        // semver requires a patch number, so we'll append '.0' if it isn't present.
        if (currentGoVersion.split('.').length === 2) {
          currentGoVersion = `${currentGoVersion}.0`;
        }
        if (semver.lt(currentGoVersion, minGoVersion)) {
          deferred.reject(new Error(
              `The current go version '${currentGoVersion}' is older than ` +
              `the minimum required version '${minGoVersion}'. ` +
              `Please upgrade your go version!`));
          return;
        }
        deferred.resolve();
      });

  return deferred.promise;
}

/**
 * Spawns a process.
 * Promises an error if the go command process fails.
 *
 * @param {string} processName - Process name to spawn.
 * @param {!Array<string>} args - Arguments of the go command.
 * @param {!Object<string, string>=} [envOverride] optional environment variables overrides map.
 * @return {Q.Promise} A promise object.
 */
function spawnProcess(processName, args, envOverride) {
  let deferred = q.defer();
  let envLocal = lodash.merge(env, envOverride);
  let goTask = child.spawn(processName, args, {
    env: envLocal,
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

/**
 * Spawns go process.
 * Promises an error if the go command process fails.
 *
 * @param {!Array<string>} args - Arguments of the go command.
 * @param {!Object<string, string>=} [envOverride] optional environment variables overrides map.
 * @return {Q.Promise} A promise object.
 */
function spawnGoProcess(args, envOverride) {
  return spawnProcess('go', args, envOverride);
}
