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
 * @fileoverview Gulp tasks for compiling backend application.
 */
import del from 'del';
import gulp from 'gulp';
import path from 'path';

import conf from './conf';
import goCommand from './gocommand';

/**
 * Compiles backend application in development mode and places the binary in the serve
 * directory.
 */
gulp.task('backend', function(doneFn) {
  goCommand(
      [
        'build',
        // Install dependencies to speed up subsequent compilations.
        '-i',
        '-o',
        path.join(conf.paths.serve, conf.backend.binaryName),
        conf.backend.packageName,
      ],
      doneFn);
});

/**
 * Compiles backend application in production mode and places the binary in the dist
 * directory.
 *
 * The production binary difference from development binary is only that it contains all
 * dependencies inside it and is targeted for Linux.
 */
gulp.task('backend:prod', function(doneFn) {
  let outputBinaryPath = path.join(conf.paths.dist, conf.backend.binaryName);

  // Delete output binary first. This is required because prod build does not override it.
  del(outputBinaryPath)
      .then(
          function() {
            goCommand(
                [
                  'build',
                  '-a',
                  '-installsuffix',
                  'cgo',
                  '-o',
                  outputBinaryPath,
                  conf.backend.packageName,
                ],
                doneFn, {
                  // Disable cgo package. Required to run on scratch docker image.
                  CGO_ENABLED: '0',
                  // Scratch docker image is linux.
                  GOOS: 'linux',
                });
          },
          function(error) { doneFn(error); });
});
