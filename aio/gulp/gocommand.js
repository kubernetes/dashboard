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

import conf from './conf.js';

const devPath = `${process.env.PATH}:${conf.paths.goTools}/bin`;
const env = lodash.merge(process.env, {PATH: devPath});

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
