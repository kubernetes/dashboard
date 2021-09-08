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

import minimist from 'minimist';
import path from 'path';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.resolve(__dirname + '/../../');

const arch = {
  default: 'amd64',
  list: ['amd64', 'arm64', 'arm', 'ppc64le', 's390x'],
};

const version = {
  release: 'v2.3.1',
};

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

const argv = envToArgv();

export default {
  /**
   * the expression of recording version info into src/app/backend/client/manager.go
   */
  recordVersionExpression:
      `-X github.com/kubernetes/dashboard/src/app/backend/client.Version=${version.release}`,

  backend: {
    binaryName: 'dashboard',
    mainPackageName: 'github.com/kubernetes/dashboard/src/app/backend',
    testCommandArgs:
        [
          'test',
          'github.com/kubernetes/dashboard/src/app/backend/...',
        ],
    devServerPort: 9090,
    secureDevServerPort: 8443,
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

  arch: arch,

  deploy: {
    version: version,
  },

  frontend: {
    serverPort: 9090,
    rootModuleName: 'kubernetesDashboard',
    serveHttps: argv.serveHttps !== undefined,
  },

  paths: {
    base: basePath,
    backendSrc: path.join(basePath, 'src/app/backend'),
    deploySrc: path.join(basePath, 'aio'),
    dist: path.join(basePath, 'dist', arch.default),
    distCross: arch.list.map((arch) => path.join(basePath, 'dist', arch)),
    distRoot: path.join(basePath, 'dist'),
    goTools: path.join(basePath, '.tools/go'),
    prodTmp: path.join(basePath, '.tmp/prod'),
    src: path.join(basePath, 'src'),
    tmp: path.join(basePath, '.tmp'),
  },
};
