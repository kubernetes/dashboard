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

import {defineConfig} from 'cypress';
import failFast from 'cypress-fail-fast/plugin';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/index.ts',
    specPattern: 'cypress/e2e/**/*.ts',
    video: false,
    chromeWebSecurity: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: '../../screenshots',
    videoCompression: false,
    pageLoadTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    defaultCommandTimeout: 10000,
    viewportHeight: 1080,
    viewportWidth: 1920,
    testIsolation: false,
    setupNodeEvents: (on, config) => {
      failFast(on, config);
      return config;
    },
  },
});
