// Copyright 2015 Google Inc. All rights reserved.
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
import gulp from 'gulp';
import gulpClangFormat from 'gulp-clang-format';
import gulpEslint from 'gulp-eslint';
import gulpSassLint from 'gulp-sass-lint';
import path from 'path';

import conf from './conf';

/**
 * Builds Dashboard and ensures that the following requirements are met:
 *   * The code follows the style guidelines.
 *   * Unit tests in frontend & backend are successful.
 *   * Integration tests against Kubernetes are successful. The cluster is
 *     expected to be up and running as a prerequisite.
 *
 * This task should be used prior to publishing a change.
 **/
gulp.task('check', ['lint', 'build', 'test', 'integration-test:prod']);

/**
 * Checks the code quality of Dashboard. In addition a local kubernetes cluster is spawned.
 * NOTE: This is meant as an entry point for CI jobs.
 */
gulp.task('check:local-cluster', ['lint', 'build', 'test', 'local-cluster-integration-test:prod']);

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
