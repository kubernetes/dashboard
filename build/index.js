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
 * @fileoverview Gulp tasks that index files with dependencies (e.g., CSS or JS) injected.
 */
import browserSync from 'browser-sync';
import gulp from 'gulp';
import gulpInject from 'gulp-inject';
import path from 'path';
import wiredep from 'wiredep';

import conf from './conf';

/**
 * Creates index file in the given directory with dependencies injected from that directory.
 *
 * @param {string} indexPath
 * @param {boolean} dev - development or production build
 * @return {!stream.Stream}
 */
function createIndexFile(indexPath, dev) {
  let injectStyles = gulp.src(path.join(indexPath, '**/*.css'), {read: false});

  let injectScripts = gulp.src(path.join(indexPath, '**/*.js'), {read: false});

  let injectOptions = {
    // Make the dependencies relative to the deps directory.
    ignorePath: [path.relative(conf.paths.base, indexPath)],
    addRootSlash: false,
    quiet: true,
  };

  let wiredepOptions = {
    // Make wiredep dependencies begin with "bower_components/" not "../../...".
    ignorePath: path.relative(conf.paths.frontendSrc, conf.paths.base),
  };

  if (dev) {
    wiredepOptions.devDependencies = true;
  }

  return gulp.src(path.join(conf.paths.frontendSrc, 'index.html'))
      .pipe(gulpInject(injectStyles, injectOptions))
      .pipe(gulpInject(injectScripts, injectOptions))
      .pipe(wiredep.stream(wiredepOptions))
      .pipe(gulp.dest(indexPath));
}

/**
 * Creates frontend application index file with development dependencies injected.
 */
gulp.task('index', ['scripts', 'styles'], function() {
  return createIndexFile(conf.paths.serve, true).pipe(browserSync.stream());
});

/**
 * Creates frontend application index file with production dependencies injected.
 */
gulp.task('index:prod', ['scripts:prod', 'styles:prod'], function() {
  return createIndexFile(conf.paths.prodTmp, false);
});
