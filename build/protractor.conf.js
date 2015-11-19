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
 * @fileoverview Configuration file for Protractor test runner.
 *
 * TODO(bryk): Start using ES6 in this file when supported.
 */
/* eslint no-var: 0 */ // no-var check disabled because this file is not written in ES6.
require('babel-core/register');
var conf = require('./conf');
var path = require('path');


/**
 * Exported protractor config required by the framework.
 *
 * Schema can be found here: https://github.com/angular/protractor/blob/master/docs/referenceConf.js
 */
exports.config = {
  baseUrl: 'http://localhost:' + conf.frontend.serverPort,

  capabilities: {
    // Firefox is used instead of Chrome, because that's what Travis supports best.
    // The browser that is used in the integration tests should not affect the results, anyway.
    'browserName': 'firefox',
  },

  framework: 'jasmine',

  specs: [path.join(conf.paths.integrationTest, '**/*.js')],
};
