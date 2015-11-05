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


/**
 * Spawns Go process wrapped with the Godep command.
 *
 * @param {!Array<string>} args
 * @param {function(?Error=)} doneFn
 * @param {!Object<string, string>=} opt_env Optional environment variables to be concatenated with
 *     default ones.
 */
export default function spawnGoProcess(args, doneFn, opt_env) {
  let goTask = child.spawn('godep', ['go'].concat(args), {
    env: lodash.merge(process.env, opt_env || {}),
  });

  // Call Gulp callback on task exit. This has to be done to make Gulp dependency management
  // work.
  goTask.on('exit', function(code) {
    if (code === 0) {
      doneFn();
    } else {
      doneFn(new Error('Go command error, code:' + code));
    }
  });

  goTask.stdout.on('data', function (data) {
    console.log('' + data);
  });

  goTask.stderr.on('data', function (data) {
    console.error('' + data);
  });
}
