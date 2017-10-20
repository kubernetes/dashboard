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

import conf from './conf';
import {multiDest} from './multidest';

/**
 * Creates head Docker image for the application for current architecture.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:head', ['build', 'docker-file'], function() {
  return buildDockerImage([[conf.deploy.headImageName, conf.paths.dist]]);
});

/**
 * Creates head Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:head:cross', ['build:cross', 'docker-file:cross'], function() {
  return buildDockerImage(lodash.zip(conf.deploy.headImageNames, conf.paths.distCross));
});

/**
 * Creates release Docker image for the application for all architectures.
 * The image is tagged with the image name configuration constant.
 */
gulp.task('docker-image:release:cross', ['build:cross', 'docker-file:cross'], function() {
  return buildDockerImage(lodash.zip(conf.deploy.releaseImageNames, conf.paths.distCross));
});

/**
 * Pushes cross compiled head images to Docker Hub.
 */
gulp.task('push-to-docker:head:cross', ['docker-image:head:cross'], function() {
  // If travis commit is available push all images and their copies tagged with commit SHA.
  if (process.env.TRAVIS_COMMIT) {
    let allImages = conf.deploy.headImageNames.concat([]);

    let spawnPromises = conf.deploy.headImageNames.map((imageName) => {
      // Regex to extract base image and its tag.
      let extractBaseRegex = /(.*):(\w+)/i;
      let newImageName = `${imageName.match(extractBaseRegex)[1]}:${process.env.TRAVIS_COMMIT}`;
      allImages.push(newImageName);
      return new Promise((resolve, reject) => {
        spawnDockerProcess(
            [
              'tag',
              imageName,
              newImageName,
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

    return Promise.all(spawnPromises).then(() => {
      return pushToDocker(allImages);
    });
  } else {
    return pushToDocker(conf.deploy.headImageNames);
  }
});

/**
 * Pushes cross-compiled release images to GCR.
 */
gulp.task('push-to-gcr:release:cross', ['docker-image:release:cross'], function() {
  return pushToGcr(conf.deploy.releaseImageNames);
});

/**
 * Processes the Docker file and places it in the dist folder for building.
 */
gulp.task('docker-file', ['clean-dist'], function() {
  return dockerFile(conf.paths.dist);
});

/**
 * Processes the Docker file and places it in the dist folder for all architectures.
 */
gulp.task('docker-file:cross', ['clean-dist'], function() {
  return dockerFile(conf.paths.distCross);
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
 * @return {!Promise}
 */
function pushToDocker(imageNames) {
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
 * @return {!Promise}
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
  return gulp.src(path.join(conf.paths.deploySrc, 'Dockerfile'))
      .pipe(multiDest(outputDirs, doneFn));
}
