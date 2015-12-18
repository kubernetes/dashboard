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
 * @fileoverview Gulp tasks for processing and compiling i18n & l10n soy templates.
 */
import gulp from 'gulp';
import gulpRename from 'gulp-rename';
import gulpSoynode from 'gulp-soynode';
import gulpUglify from 'gulp-uglify';
import path from 'path';
import soynode from 'soynode';
import uglifySaveLicense from 'uglify-save-license';

import conf from './conf';

/**
 * Compiles all i18n soy templates into one file and places the soyutils.js library
 * into the .tmp directory (development). These files are then appended to the rest of the
 * javascript code.
 */
gulp.task('soy-templates', function() {
  gulp.src(path.join(conf.paths.soyTemplates, '**/*.soy'))
      .pipe(gulpSoynode())
      .pipe(gulp.dest(conf.paths.serve));
  // copy the soyutils file to the development tmp as well
  gulp.src(path.join(conf.paths.i18n, '**/soyutils.js'))
      .pipe(gulpRename('0000-soyutils.js'))
      .pipe(gulp.dest(conf.paths.serve));
});

/**
 * Compiles all i18n soy templates into one file and places the soyutils.js library
 * into the .tmp directory (production). These files are then appended to the rest of the
 * javascript code.
 */
gulp.task('soy-templates:prod', function() {
  gulp.src(path.join(conf.paths.soyTemplates, '**/*.soy'))
      .pipe(gulpSoynode())
      // TODO: (Atanas) find a way to minify
      .pipe(gulp.dest(conf.paths.prodTmp));
  // copy the soyutils file to the production tmp as well
  gulp.src(path.join(conf.paths.i18n, '**/soyutils.js'))
      .pipe(gulpRename('0000-soyutils.js'))
      .pipe(gulpUglify({preserveComments: uglifySaveLicense}))
      .pipe(gulp.dest(conf.paths.prodTmp));
});

gulp.task('soy-extract', function() {
  gulp.src(path.join(conf.paths.soyTemplates, '**/*.soy')).pipe(gulpSoynode.lang({
    outputFile: path.join(conf.paths.soyTranslations, 'translations_en.xlf'),
  }));
});

gulp.task('soy-locales', function(doneFn) {

  soynode.setOptions({
    locales: ['de', 'bg', 'en'],
    messageFilePathFormat: path.join(conf.paths.soyTranslations, 'translations_{LOCALE}.xlf'),
    outputDir: conf.paths.i18n,
    uniqueDir: false,
  });

  soynode.compileTemplates(conf.paths.soyTemplates, function(err) {
    if (err) doneFn(err);
    doneFn();
  });

});
