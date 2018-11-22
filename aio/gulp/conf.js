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

/**
 * @fileoverview Common configuration constants used in other build/test files.
 */
import gulpUtil from 'gulp-util';
import path from 'path';

/**
 * Base path for all other paths.
 */
const basePath = path.join(__dirname, '../../');

/**
 * Compilation architecture configuration.
 */
const arch = {
  /**
   * Default architecture that the project is compiled to. Used for local development and testing.
   * TODO(bryk): Dynamically determine this based on current arch.
   */
  default: 'amd64',
  /**
   * List of all supported architectures by this project.
   */
  list: ['amd64', 'arm', 'arm64', 'ppc64le', 's390x'],
};

/**
 * Configuration for container registry to push images to.
 */
const containerRegistry = {
  release: 'k8s.gcr.io',
  /** Default to an environment variable */
  head: process.env.DOCKER_HUB_PREFIX || 'kubernetes',
};

/**
 * Package version information.
 */
const version = {
  /**
   * Current release version of the project.
   */
  release: 'v2.0.0-alpha0',
  /**
   * Version name of the head release of the project.
   */
  head: 'head',
  /**
   * Year of last source change of the project
   */
  year: '2018',
};

/**
 * Base name for the docker image.
 */
const imageNameBase = 'kubernetes-dashboard';

/**
 * Exported configuration object with common constants used in build pipeline.
 */
export default {
  /**
   * the expression of recording version info into src/app/backend/client/manager.go
   */
  recordVersionExpression:
      `-X github.com/kubernetes/dashboard/src/app/backend/client.Version=${version.release}`,

  /**
   * Configuration for container registry to push images to.
   */
  containerRegistry: containerRegistry,

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
    mainPackageName: 'github.com/kubernetes/dashboard/src/app/backend',
    /**
     * Names of all backend packages prefixed with 'test' command.
     */
    testCommandArgs:
        [
          'test',
          'github.com/kubernetes/dashboard/src/app/backend/...',
        ],
    /**
     * Insecure port number of the backend server. Only used during development.
     */
    devServerPort: 9090,
    /**
     * Secure port number of the backend server. Only used during development.
     */
    secureDevServerPort: 8443,
    /**
     * Address for the Kubernetes API server.
     */
    apiServerHost: 'http://localhost:8080',
    /**
     * Env variable with path to kubeconfig file.
     */
    kubeconfig: gulpUtil.env.kubeconfig !== undefined ? gulpUtil.env.kubeconfig : '',
    /**
     * Env variable for API request log level. If blank, the
     * dashboard defaults to INFO, publishing sanitized logs to STDOUT
     */
    apiLogLevel: gulpUtil.env.apiLogLevel !== undefined ? gulpUtil.env.apiLogLevel : '',
    /**
     * Address for the Heapster API server. If blank, the dashboard
     * will attempt to connect to Heapster via a service proxy.
     */
    heapsterServerHost: gulpUtil.env.heapsterServerHost !== undefined ?
        gulpUtil.env.heapsterServerHost :
        '',
    /**
     * File containing the default x509 Certificate for HTTPS.
     */
    tlsCert: gulpUtil.env.tlsCert !== undefined ? gulpUtil.env.tlsCert : '',
    /**
     * File containing the default x509 private key matching --tlsCert.
     */
    tlsKey: gulpUtil.env.tlsKey !== undefined ? gulpUtil.env.tlsKey : '',
    /**
     * When set to true, Dashboard will automatically generate certificates used to serve HTTPS.
     * Matches dashboard
     * '--auto-generate-certificates' flag.
     */
    autoGenerateCerts: gulpUtil.env.autoGenerateCerts !== undefined ?
        gulpUtil.env.autoGenerateCerts :
        'false',
    /**
     * Directory path containing certificate files. Matches dashboard '--default-cert-dir' flag.
     */
    defaultCertDir: gulpUtil.env.defaultCertDir !== undefined ? gulpUtil.env.defaultCertDir : '',
    /**
     * System banner message. Matches dashboard '--system-banner' flag.
     */
    systemBanner: gulpUtil.env.systemBanner !== undefined ? gulpUtil.env.systemBanner : '',
    /**
     * System banner severity. Matches dashboard '--system-banner-severity' flag.
     */
    systemBannerSeverity: gulpUtil.env.systemBannerSeverity !== undefined ?
        gulpUtil.env.systemBannerSeverity :
        '',
  },

  /**
   * Project compilation architecture info.
   */
  arch: arch,

  /**
   * Deployment constants configuration.
   */
  deploy: {
    /**
     * Project version info.
     */
    version: version,

    /**
     * Image name base for current architecture.
     */
    imageNameBase: `${imageNameBase}-${arch.default}`,

    /**
     * Image name for the head release for current architecture.
     */
    headImageName: `${containerRegistry.head}/${imageNameBase}-${arch.default}:${version.head}`,

    /**
     * Image name for the versioned release for current architecture.
     */
    releaseImageName:
        `${containerRegistry.release}/${imageNameBase}-${arch.default}:${version.release}`,

    /**
     * Image name for the head release for all supported architecture.
     */
    headImageNames: arch.list.map(
        (arch) => `${containerRegistry.head}/${imageNameBase}-${arch}:${version.head}`),

    /**
     * Image name for the versioned release for all supported architecture.
     */
    releaseImageNames: arch.list.map(
        (arch) => `${containerRegistry.release}/${imageNameBase}-${arch}:${version.release}`),
  },

  /**
   * Frontend application constants.
   */
  frontend: {
    /**
     * Port number to access the dashboard UI
     */
    serverPort: 9090,
    /**
     * The name of the root Angular module, i.e., the module that bootstraps the application.
     */
    rootModuleName: 'kubernetesDashboard',
    /**
     * If defined `gulp serve` will serve on HTTPS.
     */
    serveHttps: gulpUtil.env.serveHttps !== undefined,
  },

  /**
   * Configuration for tests.
   */
  test: {
    /**
     * Whether to use sauce labs for running tests that require a browser.
     */
    useSauceLabs: !!process.env.TRAVIS,
  },

  /**
   * Absolute paths to known directories, e.g., to source directory.
   */
  paths: {
    base: basePath,
    backendSrc: path.join(basePath, 'src/app/backend'),
    backendTmp: path.join(basePath, '.tmp/backend'),
    backendTmpSrc: path.join(
        basePath, '.tmp/backend/src/github.com/kubernetes/dashboard/src/app/backend'),
    backendTmpSrcVendor: path.join(
        basePath, '.tmp/backend/src/github.com/kubernetes/dashboard/vendor'),
    backendVendor: path.join(basePath, 'vendor'),
    deploySrc: path.join(basePath, 'aio'),
    dist: path.join(basePath, 'dist', arch.default),
    distCross: arch.list.map((arch) => path.join(basePath, 'dist', arch)),
    distPre: path.join(basePath, '.tmp/dist'),
    distPublic: path.join(basePath, 'dist', arch.default, 'public'),
    distPublicCross: arch.list.map((arch) => path.join(basePath, 'dist', arch, 'public')),
    distRoot: path.join(basePath, 'dist'),
    goTools: path.join(basePath, '.tools/go'),
    prodTmp: path.join(basePath, '.tmp/prod'),
    serve: path.join(basePath, '.tmp/serve'),
    src: path.join(basePath, 'src'),
    tmp: path.join(basePath, '.tmp'),
  },
};
