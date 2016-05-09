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
import path from 'path';
import RevAll from 'gulp-rev-all';
import runTasks from 'run-sequence';
import uglifySaveLicense from 'uglify-save-license';

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

gulp.task(
    'build-frontend', ['localize', 'locales-for-backend'], function() { return doRevision(); });

gulp.task('build-frontend:cross', ['localize:cross', 'locales-for-backend:cross'], function() {
  return doRevision();
});

/**
 * Create a subdirectory for each locale in the default arch directory.
 */
gulp.task('localize', ['distribute-files'], function(doneFn) {
  localize([path.join(conf.paths.distPre, conf.arch.default, 'public')], doneFn);
});

/**
 * Create a subdirectory for each locale in each of the arch directories.
 */
gulp.task('localize:cross', ['distribute-files:cross'], function(doneFn) {
  localize(conf.arch.list.map((arch) => path.join(conf.paths.distPre, arch, 'public')), doneFn);
});

/**
 * Copies the locales configuration to the default arch directory.
 * This configuration file is then used by the backend to localize dashboard.
 */
gulp.task('locales-for-backend', ['clean-dist'], function() {
  return localesForBackend([conf.paths.distPublic]);
});

/**
 * Copies the locales configuration to each arch directory.
 * This configuration file is then used by the backend to localize dashboard.
 */
gulp.task('locales-for-backend:cross', ['clean-dist'], function() {
  return localesForBackend(conf.paths.distPublicCross);
});

/**
 * Builds production version of the frontend application for the default architecture
 * and places it under .tmp, preparing it for localization and revision.
 */
gulp.task('distribute-files', ['fonts', 'icons', 'assets', 'index:prod', 'clean-dist'], function() {
  return distributeFiles([path.join(conf.paths.distPre, conf.arch.default, 'public')]);
});

/**
 * Builds production versions of the frontend application for all architecures
 * and places them under .tmp, preparing them for localization and revision.
 */
gulp.task(
    'distribute-files:cross',
    ['fonts:cross', 'icons:cross', 'assets:cross', 'index:prod', 'clean-dist'], function() {
      return distributeFiles(
          conf.arch.list.map((arch) => path.join(conf.paths.distPre, arch, 'public')));
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
 * Copies icons to the dist directory for current architecture.
 */
gulp.task('icons', ['clean-dist'], function() { return icons([conf.paths.distPublic]); });

/**
 * Copies icons to the dist directory for all architectures.
 */
gulp.task('icons:cross', ['clean-dist'], function() { return icons(conf.paths.distPublicCross); });

/**
 * Copies fonts to the dist directory for current architecture.
 */
gulp.task('fonts', ['clean-dist'], function() { return fonts([conf.paths.distPublic]); });

/**
 * Copies fonts to the dist directory for all architectures.
 */
gulp.task('fonts:cross', ['clean-dist'], function() { return fonts(conf.paths.distPublicCross); });

/**
 * Cleans all build artifacts.
 */
gulp.task('clean', ['clean-dist'], function() {
  return del([conf.paths.goWorkspace, conf.paths.tmp, conf.paths.coverage]);
});

/**
 * Cleans all build artifacts in the dist/ folder.
 */
gulp.task('clean-dist', function() { return del([conf.paths.distRoot, conf.paths.distPre]); });

/**
 * Builds production version of the frontend application.
 *
 * Following steps are done here:
 *  1. Vendor CSS and JS files are concatenated and minified.
 *  2. index.html is minified.
 *  4. Everything is saved in the .tmp/dist directory, ready to be localized and revisioned.
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function distributeFiles(outputDirs) {
  // create an output for each locale
  let localizedOutputDirs = outputDirs.reduce((localizedDirs, outputDir) => {
    return localizedDirs.concat(
        conf.translations.map((translation) => { return path.join(outputDir, translation.key); }));
  }, []);

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
      .pipe(gulpIf('*.html', gulpHtmlmin({
                     removeComments: true,
                     collapseWhitespace: true,
                     conservativeCollapse: true,
                   })))
      .pipe(multiDest(localizedOutputDirs));
}

/**
 * Creates revisions of all .js anc .css files at once (for production).
 * Replaces the occurances of those files in index.html with their new names.
 * index.html does not get renamed in the process.
 * The processed files are then moved to the dist directory.
 * @return {stream}
 */
function doRevision() {
  // Do not update references other than in index.html. Do not rev index.html itself.
  let revAll =
      new RevAll({dontRenameFile: ['index.html'], dontSearchFile: [/^(?!.*index\.html$).*$/]});
  return gulp.src([path.join(conf.paths.distPre, '**'), '!**/assets/**/*'])
      .pipe(revAll.revision())
      .pipe(gulp.dest(conf.paths.distRoot));
}

/**
 * Replaces the main app.js proprietary logic with a localized version
 * for each supported language in each of the arch directories.
 * @param {!Array<string>} outputDirs - list of all arch directories
 * @param {function(?Error=)} doneFn - callback
 */
function localize(outputDirs, doneFn) {
  let tasks = conf.translations.map((translation) => {
    let localizedOutputDirs =
        outputDirs.map((outputDir) => { return path.join(outputDir, translation.key, 'static'); });
    gulp.task(`localize:${translation.key}`, function(doneFn) {
      gulp.src(path.join(conf.paths.i18nProd, translation.key, '*.js'))
          .pipe(multiDest(localizedOutputDirs, doneFn));
    });
    return `localize:${translation.key}`;
  });
  runTasks(tasks, doneFn);
}

/**
 * Copies the locales configuration file at the base of each arch directory, next to
 * all of the localized subdirs. This file is meant to be used by the backend binary
 * to compare against and determine the right locale to serve at runtime.
 * @param {!Array<string>} outputDirs - list of all arch directories
 * @return {stream}
 */
function localesForBackend(outputDirs) {
  return gulp.src(path.join(conf.paths.base, 'i18n', '*.json')).pipe(multiDest(outputDirs));
}

/**
 * Copies the assets files to all dist directories per arch and locale.
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function assets(outputDirs) {
  // build for each language and cross-arch
  let localizedOutputDirs = outputDirs.reduce((localizedDirs, outputDir) => {
    return localizedDirs.concat(
        conf.translations.map((translation) => { return path.join(outputDir, translation.key); }));
  }, []);

  return gulp.src(path.join(conf.paths.assets, '/**/*'), {base: conf.paths.app})
      .pipe(multiDest(localizedOutputDirs));
}

/**
 * Copies the icons files to all dist directories per arch and locale.
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function icons(outputDirs) {
  let localizedOutputDirs = outputDirs.reduce((localizedDirs, outputDir) => {
    return localizedDirs.concat(conf.translations.map(
        (translation) => { return path.join(outputDir, translation.key, 'static'); }));
  }, []);

  return gulp
      .src(
          path.join(conf.paths.materialIcons, '/**/*.+(woff2|woff|eot|ttf)'),
          {base: conf.paths.materialIcons})
      .pipe(multiDest(localizedOutputDirs));
}

/**
 * Copies the font files to all dist directories per arch and locale.
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function fonts(outputDirs) {
  let localizedOutputDirs = outputDirs.reduce((localizedDirs, outputDir) => {
    return localizedDirs.concat(conf.translations.map(
        (translation) => { return path.join(outputDir, translation.key, 'fonts'); }));
  }, []);

  return gulp
      .src(path.join(conf.paths.robotoFonts, '/**/*.+(woff2)'), {base: conf.paths.robotoFonts})
      .pipe(multiDest(localizedOutputDirs));
}
