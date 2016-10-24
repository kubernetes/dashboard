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
import xslt from 'gulp-xslt';
import jsesc from 'jsesc';
import path from 'path';
import q from 'q';
import regexpClone from 'regexp-clone';

import conf from './conf';

/**
 * Extracts the translatable text messages for the given language key from the pre-compiled
 * files under conf.paths.{serve|messagesForExtraction}.
 * @param  {string} langKey - the locale key
 * @return {!Promise} A promise object.
 */
function extractForLanguage(langKey) {
  let deferred = q.defer();

  let translationBundle = path.join(conf.paths.base, `i18n/messages-${langKey}.xtb`);
  let codeSource = path.join(conf.paths.serve, '**.js');
  let messagesSource = path.join(conf.paths.messagesForExtraction, '**.js');
  let command = `java -jar ${conf.paths.xtbgenerator} --lang ${langKey}` +
      ` --xtb_output_file ${translationBundle} --js ${codeSource} --js ${messagesSource}`;
  if (fileExists(translationBundle)) {
    command = `${command} --translations_file ${translationBundle}`;
  }

  childProcess.exec(command, function(err, stdout, stderr) {
    if (err) {
      gulpUtil.log(stdout);
      gulpUtil.log(stderr);
      deferred.reject(new Error(err));
    }
    deferred.resolve();
  });

  return deferred.promise;
}

gulp.task('generate-xtbs', ['extract-translations', 'sort-translations']);


/**
 * Extracts all translation messages into XTB bundles.
 */
gulp.task('extract-translations', ['scripts', 'angular-templates'], function() {
  let promises = conf.translations.map((translation) => extractForLanguage(translation.key));
  return q.all(promises);
});

gulp.task('sort-translations', ['extract-translations'], function() {
  return gulp.src('i18n/messages-*.xtb').pipe(xslt('build/sortxtb.xslt')).pipe(gulp.dest('i18n'));
});


// Regex to match [[Foo | Bar]] or [[Foo]] i18n placeholders.
// Technical details:
// * First capturing group is lazy math for any string not-containing |. This is to make
//   both [[ message | desription ]] and [[ message ]] work.
// * Second is non-capturing and optional. It has a capturing group inside. This is to
//   extract description that is optional.
const I18N_REGEX = /\[\[([^|]*?)(?:\|(.*?))?\]\]/g;

export function processI18nMessages(file, minifiedHtml) {
  let content = jsesc(minifiedHtml);
  let pureHtmlContent = `${content}`;
  let filePath = path.relative(file.base, file.path);
  let messageVarPrefix = filePath.toUpperCase().split('/').join('_').replace('.HTML', '');

  /**
   * Finds all i18n messages inside a template and returns its text, description and original
   * string.
   * @param {string} htmlContent
   * @return {!Array<{text: string, desc: string, original: string}>}
   */
  function findI18nMessages(htmlContent) {
    let matches = htmlContent.match(I18N_REGEX);
    if (matches) {
      return matches.map((match) => {
        let exec = regexpClone(I18N_REGEX).exec(match);
        // Default to no description when it is not provided.
        let desc = (exec[2] || '(no description provided)').trim();
        return {text: exec[1], desc: desc, original: match};
      });
    }
    return [];
  }

  let i18nMessages = findI18nMessages(content);

  /**
   * @param {number} index
   * @return {string}
   */
  function createMessageVarName(index) {
    return `MSG_${messageVarPrefix}_${index}`;
  }

  i18nMessages.forEach((message, index) => {
    let messageVarName = createMessageVarName(index);
    // Replace i18n messages with english messages for testing and MSG_ vars invocations
    // for compiler passses.
    content = content.replace(message.original, `' + ${messageVarName} + '`);
    pureHtmlContent = pureHtmlContent.replace(message.original, message.text);
  });

  let messageVariables = i18nMessages.map((message, index) => {
    let messageVarName = createMessageVarName(index);
    return `/** @desc ${message.desc} */\n` +
        `var ${messageVarName} = goog.getMsg('${message.text}');\n`;
  });

  file.messages = messageVariables.join('\n');
  // Eval pure HTML content, because it has been jsescaped previously. This is safe to eval since
  // it was escaped by jsecs previously.
  file.pureHtmlContent = eval(`'${pureHtmlContent}'`);
  file.moduleContent = `` +
      `import module from 'index_module';\n\n${file.messages}\n` +
      `module.run(['$templateCache', ($templateCache) => {\n` +
      `    $templateCache.put('${filePath}', '${content}');\n` +
      `}]);\n`;

  return minifiedHtml;
}
