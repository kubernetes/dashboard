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
import path from 'path';

import {multiDest} from './common.js';
import conf from './conf.js';

/**
 * Processes the Docker file and places it in the dist folder for all architectures.
 */
gulp.task('docker-file:cross', () => {
  return dockerFile(conf.paths.distCross);
});

function pushToDocker(imageNames, manifest) {
  let spawnPromises = imageNames.map((imageName) => {
    return new Promise((resolve, reject) => {
      spawnDockerProcess(
        [
          'push',
          imageName,
        ],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
    });
  });

  // Create a new set of promises for annotating the manifest
  return Promise.all(spawnPromises).then(function () {
    return new Promise((resolve, reject) => {
      spawnDockerProcess(
        [
          'manifest',
          'create',
          '--amend',
          manifest,
        ].concat(imageNames),
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Once all annotations have been made, push the manifest
            let manifestPromises = imageNames.map((imageName) => {
              return new Promise((resolveManifests, rejectManifests) => {
                spawnDockerProcess(
                  [
                    'manifest',
                    'annotate',
                    manifest,
                    imageName,
                    '--os',
                    'linux',
                    '--arch',
                    conf.arch.list.filter(arch => imageName.includes(arch))[0],
                  ],
                  (err) => {
                    if (err) {
                      rejectManifests(err);
                    } else {
                      resolveManifests();
                    }
                  });
              });
            });
            // Once all annotations have been made, push the manifest
            Promise.all(manifestPromises).then(function () {
              spawnDockerProcess(
                [
                  'manifest',
                  'push',
                  manifest,
                ],
                (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
            });
          }
        });
    });
  });
}

/**
 * @param {string|!Array<string>} outputDirs
 * @param {function(?Error=)} doneFn
 * @return {stream}
 */
function dockerFile(outputDirs, doneFn) {
  return gulp.src(path.join(conf.paths.deploySrc, 'Dockerfile'))
    .pipe(multiDest(outputDirs, doneFn));
}
