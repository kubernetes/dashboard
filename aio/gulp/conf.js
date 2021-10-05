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

import path from 'path';
const arch = {
  default: 'amd64',
  list: ['amd64', 'arm64', 'arm', 'ppc64le', 's390x'],
};
const version = {release: 'v2.3.1',};
export default {
  backend: {
    mainPackageName: 'github.com/kubernetes/dashboard/src/app/backend',
    devServerPort: 9090,
    secureDevServerPort: 8443,
    apiServerHost: 'http://localhost:8080',
    apiLogLevel: argv.apiLogLevel !== undefined ? argv.apiLogLevel : '',
    metricsProvider: argv.metricsProvider !== undefined ? argv.metricsProvider : 'sidecar',
    heapsterServerHost: argv.heapsterServerHost !== undefined ? argv.heapsterServerHost : 'http://localhost:8001',
    tlsCert: argv.tlsCert !== undefined ? argv.tlsCert : '',
    tlsKey: argv.tlsKey !== undefined ? argv.tlsKey : '',
    defaultCertDir: argv.defaultCertDir !== undefined ? argv.defaultCertDir : '',
    tokenTTL: argv.tokenTTL !== undefined ? argv.tokenTTL : 0,
  },
  arch: arch,
  deploy: {
    version: version,
  },
  frontend: {
    serverPort: 9090,
    serveHttps: argv.serveHttps !== undefined,
  },
  paths: {
    dist: path.join(basePath, 'dist', arch.default),
    distCross: arch.list.map((arch) => path.join(basePath, 'dist', arch)),
  },
};
