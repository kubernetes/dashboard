// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Gulp tasks for unit and integration tests.
 */
import browserSync from 'browser-sync';
import gulp from 'gulp';
import gulpProtractor from 'gulp-protractor';
import karma from 'karma';
import path from 'path';

import conf from './conf';


/**
 * @param {boolean} singleRun
 * @param {function()} doneFn
 */
function runUnitTests(singleRun, doneFn) {
  let localConfig = {
    configFile: conf.paths.karmaConf,
    singleRun: singleRun,
    autoWatch: !singleRun
  };

  let server = new karma.Server(localConfig, function(failCount) {
    doneFn(failCount ? new Error("Failed " + failCount + " tests.") : null);
  })
  server.start();
}


/**
 * @param {function()} doneFn
 */
function runProtractorTests(doneFn) {
  gulp.src(path.join(conf.paths.integrationTest, '**/*.js'))
    .pipe(gulpProtractor.protractor({
      configFile: conf.paths.protractorConf
    }))
    .on('error', function (err) {
      // Make sure failed tests cause gulp to exit non-zero.
      throw err;
    })
    .on('end', function () {
      // Close browser sync server.
      browserSync.exit();
      doneFn();
    });
}


/**
 * Runs once all unit tests of the application.
 */
gulp.task('test', function(doneFn) {
  runUnitTests(true, doneFn);
});


/**
 * Runs all unit tests of the application. Watches for changes in the source files to rerun
 * the tests.
 */
gulp.task('test:watch', function(doneFn) {
  runUnitTests(false, doneFn);
});


/**
 * Runs application integration tests. Uses development version of the application.
 */
gulp.task('integration-test', ['serve', 'webdriver-update'], runProtractorTests);


/**
 * Runs application integration tests. Uses production version of the application.
 */
gulp.task('integration-test:prod', ['serve:prod', 'webdriver-update'], runProtractorTests);


/**
 * Downloads and updates webdriver. Required to keep it up to date.
 */
gulp.task('webdriver-update', gulpProtractor.webdriver_update);
