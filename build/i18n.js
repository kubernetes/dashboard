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
import cheerio from 'gulp-cheerio';
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

let prevMsgs = {};

gulp.task('buildExistingI18nCache', function() {
  return gulp.src('i18n/messages-en.xtb').pipe(cheerio((doc) => {
    doc('translation').each((i, translation) => {
      let key = translation.attribs.key;
      let index = key.lastIndexOf('_');
      if (index !== -1) {
        let lastpart = key.substring(index + 1);
        if (/^[0-9]+$/.test(lastpart)) {
          let indexSuffix = Number(lastpart);
          let filePrefix = key.substring(0, index);
          if (!prevMsgs[filePrefix]) {
            prevMsgs[filePrefix] = [];
          }
          prevMsgs[filePrefix].push({
            index: indexSuffix,
            key: key,
            text: doc(translation).text(),
            desc: translation.attribs.desc,
            used: false,
          });
        }
      }
    });
  }));
});

/**
 * Extracts all translation messages into XTB bundles.
 *
 * Cleans up the data from the previous run to prevent cross-pollination between
 * branches
 */
gulp.task(
    'extract-translations', ['scripts', 'angular-templates', 'clean-messages-for-extraction'],
    function() {
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
  let used = new Set();

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
        // replace {{$variableName}} with {{ $variableName}} to avoid {$ getting recognised as
        // google.getMsg format
        let text = exec[1].replace('{$', '{ $');
        let varName = undefined;
        if (prevMsgs[`MSG_${messageVarPrefix}`]) {
          for (let msg of prevMsgs[`MSG_${messageVarPrefix}`]) {
            if (msg.text === text && msg.desc === desc && !msg.used) {
              varName = msg.key;
              msg.used = true;
              used.add(msg.index);
              break;
            }
          }
        }
        return {text: text, desc: desc, original: match, varName: varName};
      });
    }
    return [];
  }

  let i18nMessages = findI18nMessages(content);

  /**
   * @param {number} index
   * @return {string}
   */
  function createMessageVarName() {
    for (let i = 0;; i++) {
      if (!used.has(i)) {
        used.add(i);
        return `MSG_${messageVarPrefix}_${i}`;
      }
    }
  }

  i18nMessages.forEach((message) => {
    message.varName = message.varName || createMessageVarName();
    // Replace i18n messages with english messages for testing and MSG_ vars invocations
    // for compiler passses.
    content = content.replace(message.original, `' + ${message.varName} + '`);
    pureHtmlContent = pureHtmlContent.replace(message.original, message.text);
  });

  let messageVariables = i18nMessages.map((message) => {
    return `/** @desc ${message.desc} */\n` +
        `var ${message.varName} = goog.getMsg('${message.text}');\n`;
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
