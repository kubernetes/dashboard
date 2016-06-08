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

import conf from './conf';
import {multiDest} from './multidest';

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
 * Creates canary Docker image for the application for current architecture.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:canary', ['build', 'docker-file'], function(doneFn) {
  buildDockerImage([[conf.deploy.canaryImageName, conf.paths.dist]], doneFn);
});

/**
 * Creates release Docker image for the application for current architecture.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:release', ['build', 'docker-file'], function(doneFn) {
  buildDockerImage([[conf.deploy.releaseImageName, conf.paths.dist]], doneFn);
});

/**
 * Creates canary Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:canary:cross', ['build:cross', 'docker-file:cross'], function(doneFn) {
  buildDockerImage(lodash.zip(conf.deploy.canaryImageNames, conf.paths.distCross), doneFn);
});

/**
 * Creates release Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:release:cross', ['build:cross', 'docker-file:cross'], function(doneFn) {
  buildDockerImage(lodash.zip(conf.deploy.releaseImageNames, conf.paths.distCross), doneFn);
});

/**
 * Pushes cross-compiled canary images to GCR.
 */
gulp.task('push-to-gcr:canary', ['docker-image:canary:cross'], function(doneFn) {
  pushToGcr(conf.deploy.versionCanary, doneFn);
});

/**
 * Pushes cross-compiled release images to GCR.
 */
gulp.task('push-to-gcr:release', ['docker-image:release:cross'], function(doneFn) {
  pushToGcr(conf.deploy.versionRelease, doneFn);
});

/**
 * Processes the Docker file and places it in the dist folder for building.
 */
gulp.task('docker-file', ['clean-dist'], function() { dockerFile(conf.paths.dist); });

/**
 * Processes the Docker file and places it in the dist folder for all architectures.
 */
gulp.task('docker-file:cross', ['clean-dist'], function() { dockerFile(conf.paths.distCross); });

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
 * @param {string} version
 * @param {function(?Error=)} doneFn
 */
function pushToGcr(version, doneFn) {
  let imageUri = `${conf.deploy.imageName}:${version}`;

  let childTask = child.spawn('gcloud', ['docker', 'push', imageUri], {stdio: 'inherit'});

  childTask.on('exit', function(code) {
    if (code === 0) {
      doneFn();
    } else {
      doneFn(new Error(`gcloud command error, code: ${code}`));
    }
  });
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function dockerFile(outputDirs) {
  return gulp.src(path.join(conf.paths.deploySrc, 'Dockerfile')).pipe(multiDest(outputDirs));
}
