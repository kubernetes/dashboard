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
 * @fileoverview Gulp tasks for processing stylesheets.
 */
import browserSync from 'browser-sync';
import gulp from 'gulp';
import gulpAutoprefixer from 'gulp-autoprefixer';
import gulpFilter from 'gulp-filter';
import gulpMinifyCss from 'gulp-minify-css';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpSass from 'gulp-sass';
import path from 'path';
import gulpConcat from 'gulp-concat';

import conf from './conf';


/**
 * Compiles stylesheets and places them into the serve folder. Each stylesheet file is compiled
 * separately.
 */
gulp.task('styles', function () {
  let sassOptions = {
    style: 'expanded',
  };

  let cssFilter = gulpFilter('**/*.css', {restore: true});

  return gulp.src(path.join(conf.paths.frontendSrc, '**/*.scss'))
    .pipe(gulpSass(sassOptions))
    .pipe(cssFilter)
    .pipe(gulpSourcemaps.init({loadMaps: true}))
    .pipe(gulpAutoprefixer())
    .pipe(gulpSourcemaps.write())
    .pipe(cssFilter.restore)
    .pipe(gulp.dest(conf.paths.serve))
    // If BrowserSync is running, inform it that styles have changed.
    .pipe(browserSync.stream());
});


/**
 * Compiles stylesheets and places them into the prod tmp folder. Styles are compiled and minified
 * into a single file.
 */
gulp.task('styles:prod', function () {
  let sassOptions = {
    style: 'compressed',
  };

  return gulp.src(path.join(conf.paths.frontendSrc, '**/*.scss'))
    .pipe(gulpSass(sassOptions))
    .pipe(gulpAutoprefixer())
    .pipe(gulpConcat('app.css'))
    .pipe(gulpMinifyCss())
    .pipe(gulp.dest(conf.paths.prodTmp));
});
