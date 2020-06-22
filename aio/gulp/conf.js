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
import minimist from 'minimist';
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
   */
  default: 'amd64',
  /**
   * List of all supported architectures by this project.
   */
  list: ['amd64', 'arm64', 'arm', 'ppc64le', 's390x'],
};

/**
 * Configuration for container registry to push images to.
 */
const containerRegistry = {
  release: 'kubernetesui',
  /** Default to an environment variable */
  head: 'kubernetesdashboarddev',
};

/**
 * Package version information.
 */
const version = {
  /**
   * Current release version of the project.
   */
  release: 'v2.0.3',
  /**
   * Version name of the head release of the project.
   */
  head: 'head',
  /**
   * Year of last source change of the project
   */
  year: '2019',
};

/**
 * Base name for the docker image.
 */
const imageNameBase = 'dashboard';

function envToArgv() {
  let envArgs = process.env.DASHBOARD_ARGS;
  let result = {};

  const args = minimist(process.argv.splice(2));
  delete args._;
  Object.keys(args).forEach(key => result[key] = args[key]);

  if(!envArgs) {
    return result;
  }

  envArgs = envArgs.split(';');
  if(envArgs.length === 0) {
    return result;
  }

  envArgs.forEach(arg => {
    const parts = arg.split('=');
    if(parts.length === 2) {
      result[parts[0]] = parts[1];
      return;
    }

    result[parts[0]] = true;
  })

  return result;
}

/**
 * Arguments
 */
const argv = envToArgv();

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
    kubeconfig: argv.kubeconfig !== undefined ? argv.kubeconfig : '',
    /**
     * Env variable for API request log level. If blank, the
     * dashboard defaults to INFO, publishing sanitized logs to STDOUT
     */
    apiLogLevel: argv.apiLogLevel !== undefined ? argv.apiLogLevel : '',
    /**
     * Setting for metrics provider. Defaults to sidecar.
     */
    metricsProvider: argv.metricsProvider !== undefined ? argv.metricsProvider : 'sidecar',
    /**
     * Address for the Heapster API server. If blank, the dashboard
     * will attempt to connect to Heapster via a service proxy.
     */
    heapsterServerHost: argv.heapsterServerHost !== undefined ?
        argv.heapsterServerHost :
        'http://localhost:8001',
    /**
     * Address for the Sidecar API server. If blank, the dashboard
     * will attempt to connect to Sidecar via a service proxy.
     */
    sidecarServerHost: argv.sidecarServerHost !== undefined ?
        argv.sidecarServerHost :
        'http://localhost:8000',
    /**
     * File containing the default x509 Certificate for HTTPS.
     */
    tlsCert: argv.tlsCert !== undefined ? argv.tlsCert : '',
    /**
     * File containing the default x509 private key matching --tlsCert.
     */
    tlsKey: argv.tlsKey !== undefined ? argv.tlsKey : '',
    /**
     * When set to true, Dashboard will automatically generate certificates used to serve HTTPS.
     * Matches dashboard
     * '--auto-generate-certificates' flag.
     */
    autoGenerateCerts: argv.autoGenerateCerts !== undefined ?
        argv.autoGenerateCerts :
        'false',
    /**
     * Directory path containing certificate files. Matches dashboard '--default-cert-dir' flag.
     */
    defaultCertDir: argv.defaultCertDir !== undefined ? argv.defaultCertDir : '',
    /**
     * System banner message. Matches dashboard '--system-banner' flag.
     */
    systemBanner: argv.systemBanner !== undefined ? argv.systemBanner : '',
    /**
     * System banner severity. Matches dashboard '--system-banner-severity' flag.
     */
    systemBannerSeverity: argv.systemBannerSeverity !== undefined ?
        argv.systemBannerSeverity :
        '',
    /**
     * Allows to override enable skip login option on the backend.
     */
    enableSkipButton: argv.enableSkipButton !== undefined ?
        argv.enableSkipButton :
        false,
    /**
     * Allows to enable login view when serving on http.
     */
    enableInsecureLogin: argv.enableInsecureLogin !== undefined ?
      argv.enableInsecureLogin :
      false,
    /**
     * Defines token time to live.
     */
    tokenTTL: argv.tokenTTL !== undefined ?
      argv.tokenTTL :
      0,
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
     * Manifest name for the head release
     */
    headManifestName: `${containerRegistry.head}/${imageNameBase}:${version.head}`,

    /**
     * Manifest name for the versioned release
     */
    releaseManifestName:
        `${containerRegistry.release}/${imageNameBase}:${version.release}`,

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
    serveHttps: argv.serveHttps !== undefined,
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
