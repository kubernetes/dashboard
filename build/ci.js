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
 * @fileoverview Entrypoint tasks for CI environments.
 */
import childProcess from 'child_process';
import gulp from 'gulp';
import codecov from 'gulp-codecov.io';
import conf from './conf';


/**
 * Builds Dashboard and ensures that integration tests against Kubernetes are successful.
 * The cluster is expected to be up and running as a prerequisite.
 **/
gulp.task('check:ci', ['check-license-headers', 'integration-test:prod']);

/**
 * Execute gulp-codecov task and uploads generated coverage report to http://codecov.io.
 * Should be used only by external CI tools, as gulp-codecov plugin is already designed
 * to work with them. Does not work locally.
 */
gulp.task('coverage-upload:ci', function() {
  gulp.src(conf.paths.coverageFrontend).pipe(codecov());
  gulp.src(conf.paths.coverageBackend).pipe(codecov());
});

/**
 * Entry point for CI to push head images to Docker Hub when master builds successfully.
 */
gulp.task('push-to-docker:ci', function(doneFn) {
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
