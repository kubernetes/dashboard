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
 * @fileoverview Gulp tasks for deploying and releasing the application.
 */
import child from 'child_process';
import gulp from 'gulp';
import lodash from 'lodash';
import path from 'path';

import {multiDest} from './common';
import conf from './conf';

/**
 * Processes the Docker file and places it in the dist folder for all architectures.
 */
gulp.task('docker-file:cross', () => {
  return dockerFile(conf.paths.distCross);
});

/**
 * Creates head Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:head:cross', gulp.series('docker-file:cross', () => {
  return buildDockerImage(lodash.zip(conf.deploy.headImageNames, conf.paths.distCross));
}));

/**
 * Creates release Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:release:cross', gulp.series('docker-file:cross', () => {
  return buildDockerImage(lodash.zip(conf.deploy.releaseImageNames, conf.paths.distCross));
}));

/**
 * Pushes cross compiled head images to Docker Hub.
 */
gulp.task('push-to-docker:head:cross', gulp.series('docker-image:head:cross', () => {
  return pushToDocker(conf.deploy.headImageNames, conf.deploy.headManifestName);
}));

/**
 * Pushes cross compiled release images to Docker Hub.
 */
gulp.task('push-to-docker:release:cross', gulp.series('docker-image:release:cross', () => {
  return pushToDocker(conf.deploy.releaseImageNames, conf.deploy.releaseManifestName);
}));

/**
 * @param {!Array<string>} args
 * @param {function(?Error=)} doneFn
 */
function spawnDockerProcess(args, doneFn) {
  let dockerTask = child.spawn('docker', args, {stdio: 'inherit'});

  // Call Gulp callback on task exit. This has to be done to make Gulp dependency management
  // work.
  dockerTask.on('exit', function (code) {
    if (code === 0) {
      doneFn();
    } else {
      doneFn(new Error(`Docker command error, code: ${code}`));
    }
  });
}

/**
 * @param {!Array<!Array<string>>} imageNamesAndDirs (image name, directory) pairs
 * @return {!Promise}
 */
function buildDockerImage(imageNamesAndDirs) {
  let spawnPromises = imageNamesAndDirs.map((imageNameAndDir) => {
    let [imageName, dir] = imageNameAndDir;
    return new Promise((resolve, reject) => {
      spawnDockerProcess(
        [
          'build',
          // Remove intermediate containers after a successful build.
          '--rm=true',
          '--tag',
          imageName,
          dir,
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

  return Promise.all(spawnPromises);
}

/**
 * @param {!Array<string>} imageNames
 * @param manifest
 * @return {!Promise}
 */
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
