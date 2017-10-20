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
 * @fileoverview Gulp tasks for building the project.
 */
import del from 'del';
import gulp from 'gulp';
import gulpUrlAdjuster from 'gulp-css-url-adjuster';
import gulpHtmlmin from 'gulp-htmlmin';
import gulpIf from 'gulp-if';
import gulpMinifyCss from 'gulp-minify-css';
import revAll from 'gulp-rev-all';
import gulpUglify from 'gulp-uglify';
import gulpUseref from 'gulp-useref';
import mergeStream from 'merge-stream';
import path from 'path';
import uglifySaveLicense from 'uglify-save-license';

import conf from './conf';
import {multiDest} from './multidest';


/**
 * Builds production package for current architecture and places it in the dist directory.
 */
gulp.task('build', ['backend:prod', 'build-frontend']);

/**
 * Builds production packages for all supported architectures and places them in the dist directory.
 */
gulp.task('build:cross', ['backend:prod:cross', 'build-frontend:cross']);

/**
 * Builds production version of the frontend application for the default architecture.
 */
gulp.task('build-frontend', ['localize', 'locales-for-backend'], function() {
  return doRevision();
});

/**
 * Builds production version of the frontend application for all supported architectures.
 */
gulp.task('build-frontend:cross', ['localize:cross', 'locales-for-backend:cross'], function() {
  return doRevision();
});

/**
 * Localizes all pre-created frontend copies for the default arch, so that they are ready to serve.
 */
gulp.task('localize', ['frontend-copies'], function() {
  return localize([path.join(conf.paths.distPre, conf.arch.default, 'public')]);
});

/**
 * Localizes all pre-created frontend copies in all cross-arch directories, so that they are ready
 * to serve.
 */
gulp.task('localize:cross', ['frontend-copies:cross'], function() {
  return localize(conf.arch.list.map((arch) => path.join(conf.paths.distPre, arch, 'public')));
});

/**
 * Copies the locales configuration to the default arch directory.
 * This configuration file is then used by the backend to localize dashboard.
 */
gulp.task('locales-for-backend', ['clean-dist'], function() {
  return localesForBackend([conf.paths.dist]);
});

/**
 * Copies the locales configuration to each arch directory.
 * This configuration file is then used by the backend to localize dashboard.
 */
gulp.task('locales-for-backend:cross', ['clean-dist'], function() {
  return localesForBackend(conf.paths.distCross);
});

/**
 * Builds production version of the frontend application for the default architecture
 * (one copy per locale) and places it under .tmp/dist , preparing it for localization and revision.
 */
gulp.task(
    'frontend-copies',
    ['fonts', 'icons', 'assets', 'dependency-images', 'index:prod', 'clean-dist'], function() {
      return createFrontendCopies([path.join(conf.paths.distPre, conf.arch.default, 'public')]);
    });

/**
 * Builds production versions of the frontend application for all architectures
 * (one copy per locale) and places them under .tmp, preparing them for localization and revision.
 */
gulp.task(
    'frontend-copies:cross',
    [
      'fonts:cross',
      'icons:cross',
      'assets:cross',
      'dependency-images:cross',
      'index:prod',
      'clean-dist',
    ],
    function() {
      return createFrontendCopies(
          conf.arch.list.map((arch) => path.join(conf.paths.distPre, arch, 'public')));
    });

/**
 * Copies assets to the dist directory for current architecture.
 */
gulp.task('assets', ['clean-dist'], function() {
  return assets([conf.paths.distPublic]);
});

/**
 * Copies assets to the dist directory for all architectures.
 */
gulp.task('assets:cross', ['clean-dist'], function() {
  return assets(conf.paths.distPublicCross);
});

/**
 * Copies icons to the dist directory for current architecture.
 */
gulp.task('icons', ['clean-dist'], function() {
  return icons([conf.paths.distPublic]);
});

/**
 * Copies icons to the dist directory for all architectures.
 */
gulp.task('icons:cross', ['clean-dist'], function() {
  return icons(conf.paths.distPublicCross);
});

/**
 * Copies fonts to the dist directory for current architecture.
 */
gulp.task('fonts', ['clean-dist'], function() {
  return fonts([conf.paths.distPublic]);
});

/**
 * Copies fonts to the dist directory for all architectures.
 */
gulp.task('fonts:cross', ['clean-dist'], function() {
  return fonts(conf.paths.distPublicCross);
});

/**
 * Copies images from dependencies to the dist directory for current architecture.
 */
gulp.task('dependency-images', ['clean-dist'], function() {
  return dependencyImages([conf.paths.distPublic]);
});

/**
 * Copies images from dependencies to the dist directory for all architectures.
 */
gulp.task('dependency-images:cross', ['clean-dist'], function() {
  return dependencyImages(conf.paths.distPublicCross);
});

/**
 * Cleans all build artifacts.
 */
gulp.task('clean', ['clean-dist'], function() {
  return del([conf.paths.goWorkspace, conf.paths.tmp, conf.paths.coverage]);
});

/**
 * Cleans all message for extraction files.
 */
gulp.task('clean-messages-for-extraction', [], function() {
  return del([conf.paths.messagesForExtraction]);
});

/**
 * Cleans all build artifacts in the dist/ folder.
 */
gulp.task('clean-dist', function() {
  return del([conf.paths.distRoot, conf.paths.distPre]);
});

/**
 * Builds production version of the frontend application and copies it to all
 * the specified outputDirs, creating one copy per (outputDir x locale) tuple.
 *
 * Following steps are done here:
 *  1. Vendor CSS and JS files are concatenated and minified.
 *  2. index.html is minified.
 *  3. Everything is saved in the .tmp/dist directory, ready to be localized and revisioned.
 *
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function createFrontendCopies(outputDirs) {
  // create an output for each locale
  let localizedOutputDirs = outputDirs.reduce((localizedDirs, outputDir) => {
    return localizedDirs.concat(conf.translations.map((translation) => {
      return path.join(outputDir, translation.key);
    }));
  }, []);

  let searchPath = [
    // To resolve local paths.
    path.relative(conf.paths.base, conf.paths.prodTmp),
    // To resolve node_modules/... paths.
    path.relative(conf.paths.base, conf.paths.base),
  ];

  return gulp.src(path.join(conf.paths.prodTmp, '*.html'))
      .pipe(gulpUseref({searchPath: searchPath}))
      .pipe(gulpIf(
          '**/vendor.css',
          gulpMinifyCss({rebase: true, relativeTo: conf.paths.tmp, target: conf.paths.tmp})))
      .pipe(gulpIf('**/vendor.css', gulpUrlAdjuster({
                     // Replace invalid prefix that is added to resolved URLs.
                     replace: ['prod/static/', ''],
                   })))
      .pipe(gulpIf('**/vendor.css', gulpUrlAdjuster({
                     // Replace invalid prefix that is added to resolved URLs.
                     replace: ['prod/', ''],
                   })))
      .pipe(gulpIf('**/vendor.js', gulpUglify({
                     output: {
                       comments: uglifySaveLicense,
                     },
                     // preserveComments: uglifySaveLicense,
                     // Disable compression of unused vars. This speeds up minification a lot (like
                     // 10 times).
                     // See https://github.com/mishoo/UglifyJS2/issues/321
                     compress: {unused: false},
                   })))
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
  return gulp
      .src([path.join(conf.paths.distPre, '**'), '!**/assets/**/*'])
      // Do not update references other than in index.html. Do not rev index.html itself.
      .pipe(revAll.revision(
          {dontRenameFile: ['index.html'], dontSearchFile: [/^(?!.*index\.html$).*$/]}))
      .pipe(gulp.dest(conf.paths.distRoot));
}

/**
 * Copies the localized app.js files for each supported language in outputDir/<locale>/static
 * for each of the specified output dirs.
 * @param {!Array<string>} outputDirs - list of all arch directories
 * @return {stream}
 */
function localize(outputDirs) {
  let streams = conf.translations.map((translation) => {
    let localizedOutputDirs = outputDirs.map((outputDir) => {
      return path.join(outputDir, translation.key, 'static');
    });
    return gulp.src(path.join(conf.paths.i18nProd, translation.key, '*.js'))
        .pipe(multiDest(localizedOutputDirs));
  });

  return mergeStream.apply(null, streams);
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
  let localizedOutputDirs = createLocalizedOutputs(outputDirs);
  return gulp.src(path.join(conf.paths.assets, '/**/*'), {base: conf.paths.app})
      .pipe(multiDest(localizedOutputDirs));
}

/**
 * Copies the icons files to all dist directories per arch and locale.
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function icons(outputDirs) {
  let localizedOutputDirs = createLocalizedOutputs(outputDirs, 'static/');
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
  let localizedOutputDirs = createLocalizedOutputs(outputDirs, 'static/');

  let roboto =
      gulp.src(path.join(conf.paths.robotoFonts, '/**/*.*'), {base: conf.paths.robotoFontsBase})
          .pipe(multiDest(localizedOutputDirs));

  let robotoMono = gulp.src(
                           path.join(conf.paths.robotoMonoFonts, '/**/*.*'),
                           {base: conf.paths.robotoMonoFontsBase})
                       .pipe(multiDest(localizedOutputDirs));

  return mergeStream.apply(null, [roboto, robotoMono]);
}

/**
 * Copies the font files to all dist directories per arch and locale.
 * @param {!Array<string>} outputDirs
 * @return {stream}
 */
function dependencyImages(outputDirs) {
  let localizedOutputDirs = createLocalizedOutputs(outputDirs, 'static/img');
  return gulp
      .src(path.join(conf.paths.jsoneditorImages, '*.png'), {base: conf.paths.jsoneditorImages})
      .pipe(multiDest(localizedOutputDirs));
}

/**
 * Returns one subdirectory path for each supported locale inside all of the specified
 * outputDirs. Optionally, a subdirectory structure can be passed to append after each locale path.
 * @param {!Array<string>} outputDirs
 * @param {undefined|string} opt_subdir - an optional sub directory inside each locale directory.
 * @return {!Array<string>} localized output directories
 */
function createLocalizedOutputs(outputDirs, opt_subdir) {
  return outputDirs.reduce((localizedDirs, outputDir) => {
    return localizedDirs.concat(conf.translations.map((translation) => {
      if (opt_subdir) {
        return path.join(outputDir, translation.key, opt_subdir);
      }
      return path.join(outputDir, translation.key);
    }));
  }, []);
}
