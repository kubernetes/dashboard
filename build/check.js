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
 * @fileoverview Gulp tasks for checking and validating the code or a commit.
 */
import fs from 'fs';
import gulp from 'gulp';
import gulpClangFormat from 'gulp-clang-format';
import gulpEslint from 'gulp-eslint';
import filter from 'gulp-filter';
import license from 'gulp-header-license';
import licenseCheck from 'gulp-license-check';
import gulpSassLint from 'gulp-sass-lint';
import beautify from 'js-beautify';
import path from 'path';
import through from 'through2';

import conf from './conf';
import {goimportsCommand} from './gocommand';

/** HTML beautifier from js-beautify package */
const htmlBeautify = beautify.html;

/** List of names of files that should be ignored during license header check */
const ignoredLicenseCheckFiles = ['fieldpath'];

/**
 * Returns correct file filter to check for license header match. Ignores files defined by
 * @ref ignoredLicenseCheckFiles
 *
 * @param {...string} ext
 * @return {string}
 */
function getLicenseFileFilter(...ext) {
  let ignorePattern =
      ignoredLicenseCheckFiles.length > 0 ? `!(${ignoredLicenseCheckFiles.join()})` : '';
  if (ext.length === 1) {
    return `**/${ignorePattern}*.${ext}`;
  }
  return `**/${ignorePattern}*.{${ext.join()}}`;
}

/**
 * Builds Dashboard and ensures that the following requirements are met:
 *   * The code follows the style guidelines.
 *   * Unit tests in frontend & backend are successful.
 *   * Integration tests against Kubernetes are successful. The cluster is
 *     expected to be up and running as a prerequisite.
 *
 * This task should be used prior to publishing a change.
 **/
gulp.task('check', ['check-license-headers', 'lint', 'test', 'integration-test:prod']);

/**
 * Checks the code quality (frontend + backend tests) of Dashboard. In addition lints the code and
 * checks if it is correctly formatted. This is meant as an entry point for CI jobs.
 */
gulp.task('check:code-quality', ['lint', 'test']);

/**
 * Lints all projects code files.
 * // TODO(bryk): Also lint Go files here.
 */
gulp.task('lint', ['lint-javascript', 'check-javascript-format', 'lint-styles']);

/**
 * Lints all projects JavaScript files using ESLint. This includes frontend source code, as well as,
 * build scripts.
 */
gulp.task('lint-javascript', function() {
  return gulp
      .src([path.join(conf.paths.src, '**/*.js'), path.join(conf.paths.build, '**/*.js')])
      // Attach lint output to the eslint property of the file.
      .pipe(gulpEslint())
      // Output the lint results to the console.
      .pipe(gulpEslint.format())
      // Exit with an error code (1) on a lint error.
      .pipe(gulpEslint.failOnError());
});

/**
 * Lints all SASS files in the project.
 */
gulp.task('lint-styles', function() {
  return gulp.src(path.join(conf.paths.src, '**/*.scss'))
      .pipe(gulpSassLint())
      .pipe(gulpSassLint.format())
      .pipe(gulpSassLint.failOnError());
});

/**
 * Checks whether project's JavaScript files are formatted according to clang-format style.
 */
gulp.task('check-javascript-format', function() {
  return gulp.src([path.join(conf.paths.src, '**/*.js'), path.join(conf.paths.build, '**/*.js')])
      .pipe(gulpClangFormat.checkFormat('file', undefined, {verbose: true, fail: true}));
});

/**
 * Formats all project files. Includes JS, HTML and Go files.
 */
gulp.task('format', ['format-javascript', 'format-html', 'format-go']);

/**
 * Formats all project's JavaScript files using clang-format.
 */
gulp.task('format-javascript', function() {
  return gulp
      .src(
          [path.join(conf.paths.src, '**/*.js'), path.join(conf.paths.build, '**/*.js')],
          {base: conf.paths.base})
      .pipe(gulpClangFormat.format('file'))
      .pipe(gulp.dest(conf.paths.base));
});

/**
 * Formats all project's HTML files using js-beautify.
 */
gulp.task('format-html', function() {
  return gulp.src([path.join(conf.paths.src, '**/*.html')], {base: conf.paths.base})
      .pipe(formatHtml({
        end_with_newline: true,
        indent_size: 2,
        wrap_attributes: 'force-aligned',
      }))
      .pipe(gulp.dest(conf.paths.base));
});

/**
 * Formats all project's Go files using goimports tool.
 */
gulp.task('format-go', function(doneFn) {
  goimportsCommand(
      [
        '-w',
        path.relative(conf.paths.base, conf.paths.backendSrc),
      ],
      doneFn);
});

/**
 * Checks and prints all source files for presence of up-to-date license headers.
 * License header templates are stored in 'license' directory.
 */
gulp.task('check-license-headers', () => {
  const HEADER_NOT_PRESENT = 'Header not present';
  const commonFilter = filter(getLicenseFileFilter('js', 'go', 'scss'), {restore: true});
  const htmlFilter = filter(getLicenseFileFilter('html'), {restore: true});

  let hasErrors = false;
  const handleLogEvent = (event) => {
    if (!hasErrors && event.msg.startsWith(HEADER_NOT_PRESENT)) {
      hasErrors = true;
    }
  };

  const handleEndEvent = () => {
    if (hasErrors) {
      throw new Error('License headers need to be present in all files.');
    }
  };

  return gulp
      .src(
          [path.join(conf.paths.src, getLicenseFileFilter('js', 'go', 'scss', 'html'))],
          {base: conf.paths.base})
      .pipe(commonFilter)
      .pipe(
          licenseCheck(licenseConfig('build/assets/license/header.txt')).on('log', handleLogEvent))
      .pipe(commonFilter.restore)
      .pipe(htmlFilter)
      .pipe(licenseCheck(licenseConfig('build/assets/license/header_html.txt'))
                .on('log', handleLogEvent))
      .pipe(htmlFilter.restore)
      .on('end', handleEndEvent);
});

/**
 * Returns config object for gulp-license-check plugin.
 * @param {string} licenseFilePath
 * @return {Object}
 */
function licenseConfig(licenseFilePath) {
  return {
    path: licenseFilePath,
    blocking: false,
    logInfo: false,
    logError: true,
  };
}

/**
 * Updates license headers in all source files based on templates stored in 'license' directory.
 */
gulp.task('update-license-headers', () => {
  const commonFilter = filter(getLicenseFileFilter('js', 'go', 'scss'), {restore: true});
  const htmlFilter = filter(getLicenseFileFilter('html'), {restore: true});
  const matchRate = 0.9;

  gulp.src(
          [path.join(conf.paths.src, getLicenseFileFilter('js', 'go', 'scss', 'html'))],
          {base: conf.paths.base})
      .pipe(commonFilter)
      .pipe(license(fs.readFileSync('build/assets/license/header.txt', 'utf8'), {}, matchRate))
      .pipe(commonFilter.restore)
      .pipe(htmlFilter)
      .pipe(license(fs.readFileSync('build/assets/license/header_html.txt', 'utf8'), {}, matchRate))
      .pipe(htmlFilter.restore)
      .pipe(gulp.dest(conf.paths.base));
});

/**
 * Can be used as gulp pipe function to format HTML files.
 *
 * Example usage:
 * gulp.src([
 *   path.join(conf.paths.frontendSrc, '**\/*.html')])
 *     .pipe(formatHtml({indent_size: 2}))
 *     .pipe(gulp.dest(out))
 *
 * All config options can be found on: https://github.com/beautify-web/js-beautify#css--html
 *
 * @param {Object} config
 * @return {Function}
 */
function formatHtml(config) {
  function format(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isBuffer()) {
      let updatedFile = htmlBeautify(file.contents.toString(), config);
      file.contents = new Buffer(updatedFile, 'utf-8');
    }

    return callback(null, file);
  }

  return through.obj(format);
}
