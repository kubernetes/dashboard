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
 * @fileoverview Common configuration constants used in other build/test files.
 */
import path from 'path';


/**
 * Base path for all other paths.
 */
const basePath = path.join(__dirname, '../');


/**
 * Exported configuration object with common constants used in build pipeline.
 */
export default {
  /**
   * Backend application constants.
   */
  backend: {
    /**
     * The name of the backend binary.
     */
    binaryName: 'dashboard',
    /**
     * Name of the main backend package that is used in go build command.
     */
    packageName: './src/app/backend',
    /**
     * Name of the test backend package that is used in go test command.
     */
    testPackageName: './src/test/backend',
  },

  /**
   * Deployment constants configuration.
   */
  deploy: {
    /**
     * The name of the Docker image with the application.
     */
    imageName: 'kubernetes/dashboard',
  },

  /**
   * Frontend application constants.
   */
  frontend: {
    /**
     * The name of the root Angular module, i.e., the module that bootstraps the application.
     */
    rootModuleName: 'kubernetesDashboard',
  },

  /**
   * Absolute paths to known directories, e.g., to source directory.
   */
  paths: {
    app: path.join(basePath, 'src/app'),
    assets: path.join(basePath, 'src/app/assets'),
    base: basePath,
    backendSrc: path.join(basePath, 'src/app/backend'),
    backendTest: path.join(basePath, 'src/test/backend'),
    backendTmp: path.join(basePath, '.tmp/backend'),
    bowerComponents: path.join(basePath, 'bower_components'),
    build: path.join(basePath, 'build'),
    deploySrc: path.join(basePath, 'src/app/deploy'),
    dist: path.join(basePath, 'dist'),
    externs: path.join(basePath, 'src/app/externs'),
    frontendSrc: path.join(basePath, 'src/app/frontend'),
    frontendTest: path.join(basePath, 'src/test/frontend'),
    goWorkspace: path.join(basePath, '.go_workspace'),
    integrationTest: path.join(basePath, 'src/test/integration'),
    karmaConf: path.join(basePath, 'build/karma.conf.js'),
    nodeModules: path.join(basePath, 'node_modules'),
    partials: path.join(basePath, '.tmp/partials'),
    prodTmp: path.join(basePath, '.tmp/prod'),
    protractorConf: path.join(basePath, 'build/protractor.conf.js'),
    serve: path.join(basePath, '.tmp/serve'),
    src: path.join(basePath, 'src'),
    tmp: path.join(basePath, '.tmp'),
  },
};
