// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Gulp tasks for compiling backend application.
 */
import child from 'child_process';
import del from 'del';
import gulp from 'gulp';
import lodash from 'lodash';
import path from 'path';

import conf from './conf';


/**
 * External dependencies of the Go backend application.
 *
 * @type {!Array<string>}
 */
const goBackendDependencies = [
  'github.com/golang/glog',
  'github.com/spf13/pflag',
];


/**
 * Spawns Go process with GOPATH placed in the backend tmp folder.
 * 
 * @param {!Array<string>} args
 * @param {function(?Error=)} doneFn
 * @param {!Object<string, string>=} opt_env Optional environment variables to be concatenated with
 *     default ones.
 */
function spawnGoProcess(args, doneFn, opt_env) {
  var goTask = child.spawn('go', args, {
    env: lodash.merge(process.env, {GOPATH: conf.paths.backendTmp}, opt_env || {}),
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


/**
 * Compiles backend application in development mode and places 'console' binary in the serve
 * directory.
 */
gulp.task('backend', ['backend-dependencies'], function(doneFn) {
  spawnGoProcess([
    'build',
    '-o', path.join(conf.paths.serve, 'console'),
    path.join(conf.paths.backendSrc, 'console.go'),
  ], doneFn);
});


/**
 * Compiles backend application in production mode and places 'console' binary in the dist
 * directory.
 *
 * The production binary difference from development binary is only that it contains all
 * dependencies inside it and is targeted for Linux.
 */
gulp.task('backend:prod', ['backend-dependencies'], function(doneFn) {
  let outputBinaryPath = path.join(conf.paths.dist, 'console');
  // Delete output binary first. This is required because prod build does not override it.
  del(outputBinaryPath)
      .then(function() {
        spawnGoProcess([
          'build',
          '-a',
          '-installsuffix', 'cgo',
          '-o', outputBinaryPath,
          path.join(conf.paths.backendSrc, 'console.go'),
        ], doneFn, {
          // Disable cgo package. Required to run on scratch docker image.
          CGO_ENABLED: '0',
          // Scratch docker image is linux.
          GOOS: 'linux',
        });
      }, function(error) {
        doneFn(error);
      });
});


/**
 * Gets backend dependencies and places them in the backend tmp directory.
 *
 * TODO(bryk): Investigate switching to Godep: https://github.com/tools/godep
 */
gulp.task('backend-dependencies', [], function(doneFn) {
  let args = ['get'].concat(goBackendDependencies);
  spawnGoProcess(args, doneFn);
});
