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

import gulp from 'gulp';
import lodash from 'lodash';
import path from 'path';

import conf from './conf.js';

/**
 * Compiles backend application in production mode for all architectures and places the
 * binary in the dist directory.
 *
 * The production binary difference from development binary is only that it contains all
 * dependencies inside it and is targeted specific architecture.
 */
gulp.task('backend:prod:cross', gulp.series(() => {
  let outputBinaryPaths =
      conf.paths.distCross.map((dir) => path.join(dir, conf.backend.binaryName));
  return backendProd(lodash.zip(outputBinaryPaths, conf.arch.list));
}));

function backendProd(outputBinaryPathsAndArchs) {
  let promiseFn = (path, arch) => {
    return (resolve, reject) => {
      goCommand(
          [
            'build',
            '-a',
            '-installsuffix',
            'cgo',
            // record version info into src/version/version.go
            '-ldflags',
            conf.recordVersionExpression,
            '-o',
            path,
            conf.backend.mainPackageName,
          ],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          },
          {
            // Disable cgo package. Required to run on scratch docker image.
            CGO_ENABLED: '0',
            GOARCH: arch,
          });
    };
  };

  let goCommandPromises = outputBinaryPathsAndArchs.map(
      (pathAndArch) => new Promise(promiseFn(pathAndArch[0], pathAndArch[1])));

  return Promise.all(goCommandPromises);
}
