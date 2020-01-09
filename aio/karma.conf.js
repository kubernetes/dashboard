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

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

let path = require('path');

module.exports = function(config) {
  let configuration = {
    basePath: path.join(__dirname, '..'),
    files: [
      // Include a Material theme in the test suite.
      {
        pattern: './node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
        included: true,
        watched: true
      },
      {
        pattern: './aio/karma-test-shim.js',
        included: true,
        watched: true,
      }
    ],

    logLevel: config.LOG_INFO,

    browserConsoleLogOptions: {terminal: true, level: ''},

    frameworks: ['jasmine', '@angular-devkit/build-angular'],

    plugins: [
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
    ],

    browserNoActivityTimeout: 5 * 60 * 1000,  // 5 minutes.

    reporters: ['progress', 'kjhtml'],

    coverageIstanbulReporter: {
      dir: path.join(__dirname, '..', 'coverage'),
      reports: ['html', 'lcovonly'],
      'report-config': {
        html: {subdir: 'html'},
      },
      fixWebpackSourcePaths: true
    },

    client: {
      clearContext: false  // leave Jasmine Spec Runner output visible in browser
    },

    angularCli: {environment: 'dev'},

    colors: true,
    autoWatch: true,
    port: 9876,
    browsers: ['Chrome'],
    singleRun: false
  };

  // Use custom browser configuration when running on Travis CI or container.
  if (!!process.env.TRAVIS || !!process.env.K8S_DASHBOARD_CONTAINER) {
    configuration.browsers = ['ChromeHeadless', 'FirefoxHeadless'];
    configuration.customLaunchers = {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--disable-gpu',
          '--headless',
          '--no-sandbox',
          '--remote-debugging-port=9222',
        ],
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless'],
      },
    };
  }

  config.set(configuration);
};
