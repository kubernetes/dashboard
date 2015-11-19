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
import gulpEslint from 'gulp-eslint';
import path from 'path';

import conf from './conf';


/**
 * Checks whether codebase is in a state that is ready for submission. This means that code
 * follows the style guide, it is buildable and all tests pass.
 *
 * This task should be used prior to publishing a change.
 *
 * TODO(cheld) enable integration tests once kuberentes cluster can be launched in travis
 * gulp.task('check', ['lint', 'build', 'test', 'integration-test:prod']);
 **/
gulp.task('check', ['lint', 'build', 'test']);

/**
 * Lints all projects code files. This includes frontend source code, as well as, build scripts.
 */
gulp.task('lint', function() {
  // TODO(bryk): Also lint Go files here.
  return gulp.src([path.join(conf.paths.src, '**/*.js'), path.join(conf.paths.build, '**/*.js')])
    // Attach lint output to the eslint property of the file.
    .pipe(gulpEslint())
    // Output the lint results to the console.
    .pipe(gulpEslint.format())
    // Exit with an error code (1) on a lint error.
    .pipe(gulpEslint.failOnError());
});
