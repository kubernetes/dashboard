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
 * @fileoverview Gulp tasks for building the project.
 */
import del from 'del';
import gulp from 'gulp';
import gulpMinifyCss from 'gulp-minify-css';
import gulpHtmlmin from 'gulp-htmlmin';
import gulpUglify from 'gulp-uglify';
import gulpIf from 'gulp-if';
import gulpUseref from 'gulp-useref';
import gulpRev from 'gulp-rev';
import gulpRevReplace from 'gulp-rev-replace';
import uglifySaveLicense from 'uglify-save-license';
import path from 'path';

import conf from './conf';
import {multiDest} from './multidest';

/**
 * Builds production package for current architecture and places it in the dist directory.
 */
gulp.task('build', ['backend:prod', 'build-frontend']);

/**
 * Builds production packages for all supported architecures and places them in the dist directory.
 */
gulp.task('build:cross', ['backend:prod:cross', 'build-frontend:cross']);

/**
 * Builds production version of the frontend application for the current architecture.
 */
gulp.task('build-frontend', ['fonts', 'icons', 'assets', 'index:prod', 'clean-dist'], function() {
  return buildFrontend(conf.paths.distPublic);
});

/**
 * Builds production version of the frontend application for all architecures.
 */
gulp.task(
    'build-frontend:cross',
    ['fonts:cross', 'icons:cross', 'assets:cross', 'index:prod', 'clean-dist'],
    function() { return buildFrontend(conf.paths.distPublicCross); });

/**
 * Copies assets to the dist directory for current architecture.
 */
gulp.task('assets', ['clean-dist'], function() { return assets([conf.paths.distPublic]); });

/**
 * Copies assets to the dist directory for all architectures.
 */
gulp.task(
    'assets:cross', ['clean-dist'], function() { return assets(conf.paths.distPublicCross); });

/**
 * Copies icons to the dist directory for current architecture.
 */
gulp.task('icons', ['clean-dist'], function() { return icons(conf.paths.iconsDistPublic); });

/**
 * Copies icons to the dist directory for all architectures.
 */
gulp.task(
    'icons:cross', ['clean-dist'], function() { return icons(conf.paths.iconsDistPublicCross); });

/**
 * Copies fonts to the dist directory for current architecture.
 */
gulp.task('fonts', ['clean-dist'], function() { return fonts(conf.paths.fontsDistPublic); });

/**
 * Copies fonts to the dist directory for all architectures.
 */
gulp.task(
    'fonts:cross', ['clean-dist'], function() { return fonts(conf.paths.fontsDistPublicCross); });

/**
 * Cleans all build artifacts.
 */
gulp.task('clean', ['clean-dist'], function() {
  return del([conf.paths.goWorkspace, conf.paths.tmp, conf.paths.coverage]);
});

/**
 * Cleans all build artifacts in the dist/ folder.
 */
gulp.task('clean-dist', function() { return del([conf.paths.distRoot]); });

/**
 * Builds production version of the frontend application.
 *
 * Following steps are done here:
 *  1. Vendor CSS and JS files are concatenated and minified.
 *  2. index.html is minified.
 *  3. CSS and JS assets are suffixed with version hash.
 *  4. Everything is saved in the dist directory.
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function buildFrontend(outputDirs) {
  let searchPath = [
    // To resolve local paths.
    path.relative(conf.paths.base, conf.paths.prodTmp),
    // To resolve bower_components/... paths.
    path.relative(conf.paths.base, conf.paths.base),
  ];

  return gulp.src(path.join(conf.paths.prodTmp, '*.html'))
      .pipe(gulpUseref({searchPath: searchPath}))
      .pipe(gulpIf('**/vendor.css', gulpMinifyCss()))
      .pipe(gulpIf('**/vendor.js', gulpUglify({preserveComments: uglifySaveLicense})))
      .pipe(gulpIf(['**/*.js', '**/*.css'], gulpRev()))
      .pipe(gulpUseref({searchPath: searchPath}))
      .pipe(gulpRevReplace())
      .pipe(gulpIf('*.html', gulpHtmlmin({
                     removeComments: true,
                     collapseWhitespace: true,
                     conservativeCollapse: true,
                   })))
      .pipe(multiDest(outputDirs));
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function assets(outputDirs) {
  return gulp.src(path.join(conf.paths.assets, '/**/*'), {base: conf.paths.app})
      .pipe(multiDest(outputDirs));
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function icons(outputDirs) {
  return gulp
      .src(
          path.join(conf.paths.materialIcons, '/**/*.+(woff2|woff|eot|ttf)'),
          {base: conf.paths.materialIcons})
      .pipe(multiDest(outputDirs));
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function fonts(outputDirs) {
  return gulp
      .src(path.join(conf.paths.robotoFonts, '/**/*.+(woff2)'), {base: conf.paths.robotoFonts})
      .pipe(multiDest(outputDirs));
}
