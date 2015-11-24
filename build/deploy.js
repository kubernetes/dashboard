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
import path from 'path';

import conf from './conf';


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
      doneFn(new Error('Docker command error, code:' + code));
    }
  });
}


/**
 * Creates Docker image for the application. The image is tagged with the image name configuration
 * constant.
 *
 * In order to run the image on a Kubernates cluster, it has to be deployed to a registry.
 */
gulp.task('docker-image', ['build', 'docker-file'], function(doneFn) {
  spawnDockerProcess(
      [
        'build',
        // Remove intermediate containers after a successful build.
        '--rm=true',
        '--tag',
        conf.deploy.imageName,
        conf.paths.dist,
      ],
      doneFn);
});


/**
 * Processes the Docker file and places it in the dist folder for building.
 */
gulp.task('docker-file', function() {
  return gulp.src(path.join(conf.paths.deploySrc, 'Dockerfile')).pipe(gulp.dest(conf.paths.dist));
});
