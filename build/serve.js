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
 * @fileoverview Gulp tasks that serve the application.
 */
import browserSync from 'browser-sync';
import browserSyncSpa from 'browser-sync-spa';
import gulp from 'gulp';
import path from 'path';

import conf from './conf';


/**
 * Initializes BrowserSync tool. Files are server from baseDir directory list.
 *
 * @param {!Array<string>|string} baseDir
 */
function browserSyncInit(baseDir) {
  // Enable custom support for Angular apps, e.g., history management.
  browserSync.use(browserSyncSpa({
    selector: '[ng-app]',
  }));

  browserSync.instance = browserSync.init({
    startPath: '/',
    server: {
      baseDir: baseDir,
    },
    browser: [], // Needed so that the browser does not auto-launch.
  });
}


/**
 * Serves the application in development mode.
 */
gulp.task('serve', ['watch'], function () {
  browserSyncInit([
    conf.paths.serve,
    conf.paths.frontendSrc, // For angular templates to work.
    conf.paths.app, // For assets to work.
    conf.paths.base, // For bower dependencies to work.
  ]);
});


/**
 * Serves the application in production mode.
 */
gulp.task('serve:prod', ['build'], function () {
  browserSyncInit(conf.paths.dist);
});


/**
 * Watches for changes in source files and runs Gulp tasks to rebuild them.
 */
gulp.task('watch', ['index'], function () {
  gulp.watch([path.join(conf.paths.frontendSrc, 'index.html'), 'bower.json'], ['index']);

  gulp.watch([
    path.join(conf.paths.frontendSrc, '**/*.scss'),
  ], function(event) {
    if(event.type === 'changed') {
      // If this is a file change, rebuild only styles - nothing more is needed.
      gulp.start('styles');
    } else {
      // If this is new/deleted file, everything has to be rebuilt.
      gulp.start('index');
    }
  });

  gulp.watch(path.join(conf.paths.frontendSrc, '**/*.js'), ['scripts'])
});
