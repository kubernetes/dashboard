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
 * @fileoverview Gulp tasks for kubernetes cluster management.
 */
import childProcess from 'child_process';
import gulp from 'gulp';
import gulpUtil from 'gulp-util';

import conf from './conf';

/**
 * The healthz URL of the cluster to check that it is running.
 */
const clusterHealthzUrl = `${conf.backend.apiServerHost}/healthz`;

/**
 * The validate URL of the heapster to check that it is running.
 */
const heapsterValidateUrl = `${conf.backend.heapsterServerHost}/api/v1/model/metrics/uptime`;

/**
 * A Number, representing the ID value of the timer that is set for function which periodically
 * checks if cluster is running. The null means that no timer is running.
 *
 * @type {?number}
 */
let isRunningSetIntervalHandler = null;

/**
 * A Number, representing the ID value of the timer that is set for function which periodically
 * checks if Heapster is running. The null means that no timer is running.
 *
 * @type {?number}
 */
let isHeapsterRunningSetIntervalHandler = null;

/**
 * Checks if cluster health check return correct status.
 * When custer is up and running then return 'ok'.
 * @param {function(?Error=)} doneFn
 */
function clusterHealthCheck(doneFn) {
  childProcess.exec(`curl ${clusterHealthzUrl}`, function(err, stdout) {
    if (err) {
      return doneFn(new Error(err));
    }
    return doneFn(stdout.trim());
  });
}

/**
 * Checks if Heapster return running state.
 * @param {function(?Error=)} doneFn
 */
function heapsterHealthCheck(doneFn) {
  childProcess.exec(`curl --compressed ${heapsterValidateUrl}`, function(err, stdout) {
    if (err) {
      return doneFn(new Error(err));
    }
    try {
      JSON.parse(stdout.trim());
    } catch (err) {
      return doneFn(err);
    }
    return doneFn('ok');
  });
}

/**
 * Creates cluster from scratch.
 * Downloads latest version of kubernetes from git repository.
 * Checkouts for latest release.
 * Executes script to up cluster.
 * Prerequisites:
 *  * Install Docker for your OS
 *  * Pull golang docker image: docker pull golang:1.4
 *  * Install golang
 *  * Install etcd
 */
gulp.task('local-up-cluster', ['spawn-cluster', 'wait-for-cluster', 'wait-for-heapster']);

/**
 * Spawns a local Kubernetes cluster running inside a Docker container.:
 */
gulp.task('spawn-cluster', function(doneFn) {
  childProcess.execFile(conf.paths.hyperkube, function(err, stdout, stderr) {
    if (err) {
      console.log(stdout);
      console.error(stderr);
      return doneFn(new Error(err));
    }
    return doneFn();
  });
});

/**
 * Checks periodically if heapster is up and running.
 */
gulp.task('wait-for-heapster', function(doneFn) {
  let counter = 0;
  if (!isHeapsterRunningSetIntervalHandler) {
    isHeapsterRunningSetIntervalHandler = setInterval(isRunning, 1000);
  }

  function isRunning() {
    if (counter % 10 === 0) {
      gulpUtil.log(gulpUtil.colors.magenta(`Waiting for a Heapster ...`));
    }
    counter += 1;

    // constantly query the heapster until it is properly running
    heapsterHealthCheck(function(result) {
      if (result === 'ok' && isHeapsterRunningSetIntervalHandler !== null) {
        gulpUtil.log(gulpUtil.colors.magenta('Heapster is up and running.'));
        clearTimeout(isHeapsterRunningSetIntervalHandler);
        isHeapsterRunningSetIntervalHandler = null;
        doneFn();
      }
    });
  }
});

/**
 * Checks periodically if cluster is up and running.
 */
gulp.task('wait-for-cluster', function(doneFn) {
  let counter = 0;
  if (!isRunningSetIntervalHandler) {
    isRunningSetIntervalHandler = setInterval(isRunning, 1000);
  }

  function isRunning() {
    if (counter % 10 === 0) {
      gulpUtil.log(gulpUtil.colors.magenta(
          `Waiting for a Kubernetes cluster at ${conf.backend.apiServerHost}...`));
    }
    counter += 1;

    // constantly query the cluster until it is properly running
    clusterHealthCheck(function(result) {
      if (result === 'ok' && isRunningSetIntervalHandler !== null) {
        gulpUtil.log(gulpUtil.colors.magenta('Kubernetes cluster is up and running.'));
        clearTimeout(isRunningSetIntervalHandler);
        isRunningSetIntervalHandler = null;
        doneFn();
      }
    });
  }
});
