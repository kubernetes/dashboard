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
 * @fileoverview Gulp tasks for the extraction of translatable messages.
 */
import childProcess from 'child_process';
import fileExists from 'file-exists';
import gulp from 'gulp';
import gulpUtil from 'gulp-util';
import path from 'path';
import q from 'q';

import conf from './conf';

/**
 * Extracts the translatable text messages for the given language key from the pre-compiled
 * files under conf.paths.serve.
 * @param  {string} langKey - the locale key
 * @return {!Promise} A promise object.
 */
function extractForLanguage(langKey) {
  let deferred = q.defer();

  let translationBundle = path.join(conf.paths.base, `i18n/messages-${langKey}.xtb`);
  let codeSource = path.join(conf.paths.serve, '*.js');
  let command = `java -jar ${conf.paths.xtbgenerator} --lang cs` +
      ` --xtb_output_file ${translationBundle}` + ` --js ${codeSource}`;
  if (fileExists(translationBundle)) {
    command = `${command} --translations_file ${translationBundle}`;
  }

  childProcess.exec(command, function(err, stdout, stderr) {
    if (err) {
      gulpUtil.log(stdout);
      gulpUtil.log(stderr);
      deferred.reject();
      deferred.reject(new Error(err));
    }
    return deferred.resolve();
  });

  return deferred.promise;
}

/**
 * Extracts all translation messages into XTB bundles.
 */
gulp.task('extract-translations', ['scripts'], function() {
  let promises = conf.translations.map((translation) => extractForLanguage(translation.key));
  return q.all(promises);
});
