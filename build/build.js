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
 * @fileoverview Gulp tasks for building the project.
 */
import del from 'del';
import gulp from 'gulp';
import gulpFilter from 'gulp-filter';
import gulpMinifyCss from 'gulp-minify-css';
import gulpMinifyHtml from 'gulp-minify-html';
import gulpUglify from 'gulp-uglify';
import gulpUseref from 'gulp-useref';
import gulpRev from 'gulp-rev';
import gulpRevReplace from 'gulp-rev-replace';
import gulpSize from 'gulp-size';
import uglifySaveLicense from 'uglify-save-license';
import path from 'path';

import conf from './conf';


/**
 * Builds production package and places it in the dist directory.
 *
 * Following steps are done here:
 *  1. Vendor CSS and JS files are concatenated and minified.
 *  2. index.html is minified.
 *  3. CSS and JS assets are suffixed with version hash.
 *  4. Everything is saved in the dist directory.
 */
gulp.task('build', ['index:prod', 'assets'], function () {
  let htmlFilter = gulpFilter('*.html', {restore: true});
  let vendorCssFilter = gulpFilter('**/vendor.css', {restore: true});
  let vendorJsFilter = gulpFilter('**/vendor.js', {restore: true});
  let assets;

  return gulp.src(path.join(conf.paths.prodTmp, '*.html'))
    .pipe(assets = gulpUseref.assets({
      searchPath: [
        // To resolve local paths.
        conf.paths.prodTmp,
        // To resolve bower_components/... paths.
        conf.paths.base,
      ],
    }))
    .pipe(vendorCssFilter)
    .pipe(gulpMinifyCss())
    .pipe(vendorCssFilter.restore)
    .pipe(vendorJsFilter)
    .pipe(gulpUglify({preserveComments: uglifySaveLicense}))
    .pipe(vendorJsFilter.restore)
    .pipe(gulpRev())
    .pipe(assets.restore())
    .pipe(gulpUseref({searchPath: [conf.paths.prodTmp]}))
    .pipe(gulpRevReplace())
    .pipe(htmlFilter)
    .pipe(gulpMinifyHtml({
      empty: true,
      spare: true,
      quotes: true,
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(conf.paths.dist))
    .pipe(gulpSize({showFiles: true}));
});


/**
 * Copies assets to the dist directory.
 */
gulp.task('assets', function () {
  return gulp.src(path.join(conf.paths.assets, '/**/*'), {base: conf.paths.app})
    .pipe(gulp.dest(conf.paths.dist));
});


/**
 * Cleans all build artifacts.
 */
gulp.task('clean', function () {
  return del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});
