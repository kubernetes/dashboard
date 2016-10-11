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
 * @fileoverview Gulp tasks for deploying and releasing the application.
 */
import child from 'child_process';
import gulp from 'gulp';
import lodash from 'lodash';
import path from 'path';
import gutil from 'gulp-util';

import conf from './conf';
import {multiDest} from './multidest';

/**
 * Creates canary Docker image for the application for current architecture.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:canary', ['build', 'docker-file'], function() {
  buildDockerImage([[conf.deploy.canaryImageName, conf.paths.dist]]);
});

/**
 * Creates canary Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:canary:cross', ['build:cross', 'docker-file:cross'], function() {
  return buildDockerImage(lodash.zip(conf.deploy.canaryImageNames, conf.paths.distCross));
});

/**
 * Creates release Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:release:cross', ['build:cross', 'docker-file:cross'], function() {
  return buildDockerImage(lodash.zip(conf.deploy.releaseImageNames, conf.paths.distCross));
});

/**
 * Pushes cross compiled canary images to Docker Hub.
 */
gulp.task('push-to-docker:canary:cross', ['docker-image:canary:cross'], function() {
  pushToDocker(conf.deploy.canaryImageNames);
});

/**
 * Pushes cross-compiled release images to GCR.
 */
gulp.task('push-to-gcr:release:cross', ['docker-image:release:cross'], function() {
  pushToGcr(conf.deploy.releaseImageNames);
});

/**
 * Processes the Docker file and places it in the dist folder for building.
 */
gulp.task('docker-file', ['clean-dist'], function() {
  dockerFile(conf.paths.dist, doneFn);
});

/**
 * Processes the Docker file and places it in the dist folder for all architectures.
 */
gulp.task('docker-file:cross', ['clean-dist'], function(doneFn) {
  dockerFile(conf.paths.distCross, doneFn);
});

/**
 * @param {!Array<string>} args
 * @param {function(?Error=)} doneFn
 */
function spawnDockerProcess(args, doneFn) {
  let dockerTask = child.spawn('docker', args, {stdio: 'inherit'});

  // Call Gulp callback on task exit. This has to be done to make Gulp dependency management
  // work.
  dockerTask.on('exit', function(code) {
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
 */
function pushToDocker(imageNames) {
  let spawnPromises = imageNames.forEach((imageName) => {
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

  return Promise.all(spawnPromises);
}

/**
 * @param {!Array<string>} args
 * @param {function(?Error=)} doneFn
 */
function spawnGCloudProcess(args, doneFn) {
  let gcloudTask = child.spawn('gcloud', args, {stdio: 'inherit'});

  // Call Gulp callback on task exit. This has to be done to make Gulp dependency management
  // work.
  gcloudTask.on('exit', function(code) {
    if (code === 0) {
      doneFn();
    } else {
      doneFn(new Error(`GCloud command error, code: ${code}`));
    }
  });
}

/**
 * @param {!Array<string>} imageNames
 */
function pushToGcr(imageNames) {
  let spawnPromises = imageNames.forEach((imageName) => {
    return new Promise((resolve, reject) => {
      spawnGCloudProcess(
        [
          'docker',
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

  return Promise.all(spawnPromises);
}

/**
 * @param {string|!Array<string>} outputDirs
 * @param {function(?Error=)} doneFn
 * @return {stream}
 */
function dockerFile(outputDirs, doneFn) {
  return gulp.src(path.join(conf.paths.deploySrc, 'Dockerfile')).pipe(multiDest(outputDirs, doneFn));
}