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
import async from 'async';
import del from 'del';
import gulp from 'gulp';
import gulpFilter from 'gulp-filter';
import gulpMinifyCss from 'gulp-minify-css';
import gulpHtmlmin from 'gulp-htmlmin';
import gulpUglify from 'gulp-uglify';
import gulpUseref from 'gulp-useref';
import gulpRev from 'gulp-rev';
import gulpRevReplace from 'gulp-rev-replace';
import uglifySaveLicense from 'uglify-save-license';
import path from 'path';

import conf from './conf';

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
gulp.task('build-frontend', ['assets', 'index:prod', 'clean-dist'], function(doneFn) {
  buildFrontend(conf.paths.distPublic, doneFn);
});

/**
 * Builds production version of the frontend application for all architecures.
 */
gulp.task('build-frontend:cross', ['assets:cross', 'index:prod', 'clean-dist'], function(doneFn) {
  buildFrontend(conf.paths.distPublicCross, doneFn);
});

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
 * @param {function(?Error=)} doneFn - Callback.
 */
function buildFrontend(outputDirs, doneFn) {
  if (!Array.isArray(outputDirs)) {
    outputDirs = [outputDirs];
  }

  let buildSteps = [];
  // build for for each locale language and cross-arch
  conf.translations.forEach((translation) => outputDirs.forEach((outputDir) => {
    let htmlFilter = gulpFilter('*.html', {restore: true});
    let vendorCssFilter = gulpFilter('**/vendor.css', {restore: true});
    let vendorJsFilter = gulpFilter('**/vendor.js', {restore: true});
    let assetsFilter = gulpFilter(['**/*.js', '**/*.css'], {restore: true});
    let searchPath = [
      // To resolve local paths.
      path.relative(conf.paths.base, `${conf.paths.prodTmp}/${translation.key}`),
      // To resolve bower_components/... paths.
      path.relative(conf.paths.base, conf.paths.base),
    ];
    let localizedOutputDir = `${outputDir}/${translation.key}`;
    let buildStep =
        ((next) => gulp.src(path.join(`${conf.paths.prodTmp}/${translation.key}`, `*.html`))
                       .pipe(gulpUseref({searchPath: searchPath}))
                       .pipe(vendorCssFilter)
                       .pipe(gulpMinifyCss())
                       .pipe(vendorCssFilter.restore)
                       .pipe(vendorJsFilter)
                       .pipe(gulpUglify({preserveComments: uglifySaveLicense}))
                       .pipe(vendorJsFilter.restore)
                       .pipe(assetsFilter)
                       .pipe(gulpRev())
                       .pipe(assetsFilter.restore)
                       .pipe(gulpUseref({searchPath: searchPath}))
                       .pipe(gulpRevReplace())
                       .pipe(htmlFilter)
                       .pipe(gulpHtmlmin({
                         removeComments: true,
                         collapseWhitespace: true,
                         conservativeCollapse: true,
                       }))
                       .pipe(htmlFilter.restore)
                       .pipe(gulp.dest(localizedOutputDir))
                       .on('end', next));
    buildSteps.push(buildStep);
  }));
  async.series(buildSteps, doneFn);
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function assets(outputDirs) {
  let buildSteps = [];
  // build for each language and cross-arch
  conf.translations.forEach((translation) => outputDirs.forEach((outputDir) => {
    let localizedOutputDir = `${outputDir}/${translation.key}`;
    let buildStep =
        ((next) => gulp.src(path.join(conf.paths.assets, '/**/*'), {base: conf.paths.app})
                       .pipe(gulp.dest(localizedOutputDir))
                       .on('end', next));
    buildSteps.push(buildStep);
  }));
  return async.series(buildSteps);
}
