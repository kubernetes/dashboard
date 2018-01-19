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
import filter from 'gulp-filter';
import license from 'gulp-header-license';
import licenseCheck from 'gulp-license-check';
import path from 'path';

import conf from './conf';

/**
 * Returns correct file filter to check for license header match. Ignores files defined by
 * @ref ignoredLicenseCheckFiles
 *
 * @param {...string} ext
 * @return {string}
 */
function getLicenseFileFilter(...ext) {
  return ext.length > 1 ? `**/*.{${ext.join()}}` : `**/*.${ext}`;
}

/**
 * Checks and prints all source files for presence of up-to-date license headers.
 * License header templates are stored in 'license' directory.
 */
gulp.task('check-license-headers', () => {
  const HEADER_NOT_PRESENT = 'Header not present';
  const commonFilter = filter(getLicenseFileFilter('ts', 'go', 'scss'), {restore: true});
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
          [path.join(conf.paths.src, getLicenseFileFilter('ts', 'go', 'scss', 'html'))],
          {base: conf.paths.base})
      .pipe(commonFilter)
      .pipe(licenseCheck(licenseConfig('aio/templates/header.txt')).on('log', handleLogEvent))
      .pipe(commonFilter.restore)
      .pipe(htmlFilter)
      .pipe(licenseCheck(licenseConfig('aio/templates/header_html.txt')).on('log', handleLogEvent))
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
  const commonFilter = filter(getLicenseFileFilter('ts', 'go', 'scss'), {restore: true});
  const htmlFilter = filter(getLicenseFileFilter('html'), {restore: true});
  const matchRate = 0.9;

  gulp.src(
          [path.join(conf.paths.src, getLicenseFileFilter('ts', 'go', 'scss', 'html'))],
          {base: conf.paths.base})
      .pipe(commonFilter)
      .pipe(license(fs.readFileSync('aio/templates/header.txt', 'utf8'), {}, matchRate))
      .pipe(commonFilter.restore)
      .pipe(htmlFilter)
      .pipe(license(fs.readFileSync('aio/templates/header_html.txt', 'utf8'), {}, matchRate))
      .pipe(htmlFilter.restore)
      .pipe(gulp.dest(conf.paths.base));
});
