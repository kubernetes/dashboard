// Copyright 2015 Google Inc. All rights reserved.
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
 * @fileoverview Entrypoint tasks for ci environments.
 */
import childProcess from 'child_process';
import gulp from 'gulp';

/**
 * Entry point for CI to push head images to Docker Hub when master builds successfully.
 */
gulp.task('ci-push-to-docker:head:cross', function(doneFn) {
  if (process.env.TRAVIS) {
    // Pushes head images when docker user and password are available.
    if (process.env.TRAVIS_PULL_REQUEST === 'false' && process.env.DOCKER_USER &&
        process.env.DOCKER_PASS) {
      childProcess.exec('docker login -u $DOCKER_USER -p $DOCKER_PASS', (err, stdout, stderr) => {
        if (err) {
          doneFn(new Error(`Cannot login to docker: ${err}, ${stdout}, ${stderr}`));
        } else {
          gulp.start('push-to-docker:head:cross');
          doneFn();
        }
      });
    } else {
      doneFn();
    }
  } else {
    doneFn(new Error('Not in a CI environment (such as Travis). Aborting.'));
  }
});
