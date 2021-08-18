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

import child from 'child_process';
import gulp from 'gulp';
import path from 'path';

import conf from './conf.js';

function getBackendArgs() {
  let args = [
    `--sidecar-host=${conf.backend.sidecarServerHost}`,
    `--tls-cert-file=${conf.backend.tlsCert}`,
    `--tls-key-file=${conf.backend.tlsKey}`,
    `--auto-generate-certificates=${conf.backend.autoGenerateCerts}`,
    `--enable-insecure-login=${conf.backend.enableInsecureLogin}`,
    `--enable-skip-login=${conf.backend.enableSkipButton}`
  ];

  if (conf.backend.systemBanner.length > 0) {
    args.push(`--system-banner=${conf.backend.systemBanner}`);
  }

  if (conf.backend.systemBannerSeverity.length > 0) {
    args.push(`--system-banner-severity=${conf.backend.systemBannerSeverity}`);
  }

  if (conf.backend.defaultCertDir.length > 0) {
    args.push(`--default-cert-dir=${conf.backend.defaultCertDir}`);
  }

  if (conf.backend.kubeconfig) {
    args.push(`--kubeconfig=${conf.backend.kubeconfig}`);
  } else {
    args.push(`--apiserver-host=${conf.backend.apiServerHost}`);
  }

  if(conf.backend.tokenTTL) {
    args.push(`--token-ttl=${conf.backend.tokenTTL}`);
  }

  return args;
}

/**
 * Copies the locales configuration to the serve directory.
 * In development, this configuration plays no significant role and serves as a stub.
 */
gulp.task('locales-for-backend:dev', () => {
  return gulp.src(path.join(conf.paths.base, 'i18n', '*.json')).pipe(gulp.dest(conf.paths.serve));
});

/**
 * Watches for changes in source files and runs Gulp tasks to rebuild them.
 */
gulp.task('watch', () => {
  gulp.watch(path.join(conf.paths.backendSrc, '**/*.go'), gulp.parallel('spawn-backend', 'watch'));
});

/**
 * Spawns new backend application process and finishes the task immediately. Previously spawned
 * backend process is killed beforehand, if any. The frontend pages are served by BrowserSync.
 */
gulp.task('spawn-backend', gulp.series(gulp.parallel('kill-backend', 'backend', 'locales-for-backend:dev'), () => {
  if (process.env.K8S_DASHBOARD_DEBUG) {
    runningBackendProcess = child.spawn(
      "dlv", ["exec", "--headless", "--listen=0.0.0.0:2345", "--api-version=2", "--", path.join(conf.paths.serve, conf.backend.binaryName)].concat(getBackendArgs()),
      {stdio: 'inherit', cwd: conf.paths.serve});
  } else {
    runningBackendProcess = child.spawn(
      path.join(conf.paths.serve, conf.backend.binaryName), getBackendArgs(),
      {stdio: 'inherit', cwd: conf.paths.serve});
  }

  runningBackendProcess.on('exit', () => {
    // Mark that there is no backend process running anymore.
    runningBackendProcess = null;
  });
}));

gulp.task('serve', gulp.parallel('spawn-backend', 'watch'));
