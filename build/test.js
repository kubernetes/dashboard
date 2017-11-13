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
 * @fileoverview Gulp tasks for unit and integration tests.
 */
import childProcess from 'child_process';
import gulp from 'gulp';
import gulpProtractor from 'gulp-protractor';
import karma from 'karma';
import path from 'path';
import conf from './conf';
import goCommand from './gocommand';
import {browserSyncInstance} from './serve';


/**
 * @param {boolean} singleRun
 * @param {function(?Error=)} doneFn
 */
function runFrontendUnitTests(singleRun, doneFn) {
  let localConfig = {
    configFile: conf.paths.karmaConf,
    singleRun: singleRun,
    autoWatch: !singleRun,
  };

  let server = new karma.Server(localConfig, function(failCount) {
    doneFn(failCount ? new Error(`Failed ${failCount} tests.`) : undefined);
  });
  server.start();
}

/**
 * @param {function(?Error=)} doneFn
 */
function runProtractorTests(doneFn) {
  gulp.src(path.join(conf.paths.integrationTest, '**/*.js'))
      .pipe(gulpProtractor.protractor({
        configFile: conf.paths.protractorConf,
      }))
      .on('error',
          function(err) {
            // Close browser sync server to prevent the process from hanging.
            browserSyncInstance.exit();
            // Kill backend server and cluster, if running.
            gulp.start('kill-backend');
            doneFn(err);
          })
      .on('end', function() {
        // Close browser sync server to prevent the process from hanging.
        browserSyncInstance.exit();
        // Kill backend server and cluster, if running.
        gulp.start('kill-backend');
        doneFn();
      });
}

/**
 * Runs once all unit tests of the application.
 */
gulp.task('test', ['frontend-test', 'backend-test-with-coverage']);

/**
 * Runs once all unit tests of the frontend application.
 */
gulp.task('frontend-test', ['set-test-node-env'], function(doneFn) {
  runFrontendUnitTests(true, doneFn);
});

/**
 * Runs once all unit tests of the backend application.
 */
gulp.task('backend-test', ['package-backend'], function(doneFn) {
  goCommand(conf.backend.testCommandArgs, doneFn);
});

/**
 * Runs once all unit tests of the backend application with coverage report.
 */
gulp.task('backend-test-with-coverage', ['package-backend'], function(doneFn) {
  let testProcess = childProcess.execFile(
      conf.paths.goTestScript, [conf.paths.coverageBackend, conf.backend.mainPackageName]);

  testProcess.stdout.pipe(process.stdout);
  testProcess.stderr.pipe(process.stderr);

  testProcess.on('close', (code) => {
    if (code !== 0) {
      return doneFn(new Error(`Process exited with code: ${code}`));
    }

    return doneFn();
  });
});

/**
 * Runs all unit tests of the application. Watches for changes in the source files to rerun
 * the tests.
 */
gulp.task('test:watch', ['frontend-test:watch', 'backend-test:watch']);

/**
 * Runs frontend backend application tests. Watches for changes in the source files to rerun
 * the tests.
 */
gulp.task('frontend-test:watch', ['set-test-node-env'], function(doneFn) {
  runFrontendUnitTests(false, doneFn);
});

/**
 * Runs backend application tests. Watches for changes in the source files to rerun
 * the tests.
 */
gulp.task('backend-test:watch', ['backend-test'], function() {
  gulp.watch([path.join(conf.paths.backendSrc, '**/*.go')], ['backend-test']);
});

/**
 * Runs application integration tests. Uses development version of the application.
 */
gulp.task('integration-test', ['serve:nowatch', 'webdriver-update'], runProtractorTests);

/**
 * Runs application integration tests. Uses production version of the application.
 */
gulp.task('integration-test:prod', ['serve:prod', 'webdriver-update'], runProtractorTests);

/**
 * Downloads and updates webdriver. Required to keep it up to date.
 */
gulp.task('webdriver-update', gulpProtractor.webdriver_update);
