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

// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter} = require('jasmine-spec-reporter');

/**
 * Schema can be found here: https://github.com/angular/protractor/blob/master/docs/referenceConf.js
 * @return {!Object}
 */
function createConfig() {
  const config = {
    allScriptsTimeout: 10000,
    specs: ['../src/test/e2e/**/*.e2e-spec.ts'],
    baseUrl: 'http://localhost:8080/',
    framework: 'jasmine',
    jasmineNodeOpts: {showColors: true, defaultTimeoutInterval: 30000, print: function() {}},
    onPrepare() {
      require('ts-node').register({project: 'aio/tsconfig.e2e.json'});
      jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
    }
  };

  // Use custom browser configuration when running on Travis CI and master/tag is being build.
  if (!!process.env.TRAVIS && !process.env.TRAVIS_PULL_REQUEST) {
    let name = `Integration tests ${process.env.TRAVIS_REPO_SLUG}, build ` +
        `${process.env.TRAVIS_BUILD_NUMBER}, job ${process.env.TRAVIS_JOB_NUMBER}`;
    if (process.env.TRAVIS_PULL_REQUEST !== 'false') {
      name += `, PR: https://github.com/${process.env.TRAVIS_REPO_SLUG}/pull/` +
          `${process.env.TRAVIS_PULL_REQUEST}, job ${process.env.TRAVIS_JOB_NUMBER}`;
    }

    config.sauceUser = process.env.SAUCE_USERNAME;
    config.sauceKey = process.env.SAUCE_ACCESS_KEY;
    config.capabilities =  {
      'browserName': 'chrome',
      'chromeOptions': {'args': ['--headless', '--disable-gpu', '--window-size=800,600']},
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'name': name,
    };

    // Limit concurrency to not exhaust saucelabs resources for the CI user.
    config.maxSessions = 1;

  } else {
    config.capabilities = {
      'browserName': 'chrome',
      'chromeOptions': {'args': ['--headless', '--disable-gpu', '--no-sandbox', '--window-size=800,600']},
    };
  }

  return config;
}

/**
 * Exported protractor config required by the framework.
 */
exports.config = createConfig();
