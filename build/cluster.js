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
import del from 'del';
import gulp from 'gulp';
import chmod from 'gulp-chmod';
import gulpFilter from 'gulp-filter';
import git from 'gulp-git';
import gunzip from 'gulp-gunzip';
import untar from 'gulp-untar';
import gulpUtil from 'gulp-util';
import pathExists from 'path-exists';
import request from 'request';
import source from 'vinyl-source-stream';

import conf from './conf';

const kubernetesArchive = 'kubernetes.tar.gz';
const kubernetesUrl = 'https://github.com/kubernetes/kubernetes.git';
const stableVersion = 'v1.1.1';
const tarballUrl = 'https://storage.googleapis.com/kubernetes-release/release';
const upScript = `${conf.paths.kubernetes}/hack/local-up-cluster.sh`;

/**
 * The healthz URL of the cluster to check that it is running.
 */
const clusterHealthzUrl = `http://${conf.backend.apiServerHost}/healthz`;

/**
 * Currently running cluster process object. Null if the cluster is not running.
 *
 * @type {?child.ChildProcess}
 */
let clusterProcess = null;

/**
 * @type {boolean} The variable is set when there is an error during cluster creation.
 */
let clusterSpawnFailure = null;

/**
 * A Number, representing the ID value of the timer that is set for function which periodically
 * checks if cluster is running. The null means that no timer is running.
 *
 * @type {?number}
 */
let isRunningSetIntervalHandler = null;

/**
 * Checks if there was a failure during cluster creation.
 * Produces an error in case there was one.
 * @param {function(?Error=)} doneFn - callback for the error
 */
function checkForClusterFailure(doneFn) {
  if (clusterSpawnFailure) {
    clearTimeout(isRunningSetIntervalHandler);
    isRunningSetIntervalHandler = null;
    doneFn(new Error('There was an error during cluster creation. Aborting.'));
  }
}

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
 * Executes controls command using kubectl.
 * @param {string} command
 * @param {function(?Error=)} doneFn
 */
function executeKubectlCommand(command, doneFn) {
  childProcess.exec(`${conf.paths.kubernetes}/cluster/kubectl.sh ${command}`, function(err) {
    if (err) return doneFn(new Error(err));
    doneFn();
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
gulp.task('local-up-cluster', ['spawn-cluster', 'wait-for-cluster']);

/**
 * Tears down a Kubernetes cluster.
 */
gulp.task('kill-cluster', function(doneFn) {
  if (clusterProcess) {
    clusterProcess.on('exit', function() {
      clusterProcess = null;
      doneFn();
    });
    clusterProcess.kill();
  } else {
    doneFn();
  }
});

/**
 * Clones kubernetes from git repository. Task skip if kubernetes directory exist.
 */
gulp.task('clone-kubernetes', function(doneFn) {
  pathExists(conf.paths.kubernetes).then(function(exists) {
    if (!exists) {
      git.clone(kubernetesUrl, {args: conf.paths.kubernetes}, function(err) {
        if (err) return doneFn(new Error(err));
        doneFn();
      });
    } else {
      doneFn();
    }
  });
});

/**
 * Checkouts kubernetes to latest stable version.
 */
gulp.task('checkout-kubernetes-version', ['clone-kubernetes'], function(doneFn) {
  git.checkout(stableVersion, {cwd: conf.paths.kubernetes, quiet: true}, function(err) {
    if (err) return doneFn(new Error(err));
    doneFn();
  });
});

/**
 * Checks if kubectl is already downloaded.
 * If not downloads kubectl for all platforms from tarball.
 */
gulp.task('download-kubectl', function(doneFn) {
  let filter = gulpFilter('**/platforms/**');
  pathExists(`${conf.paths.kubernetes}/platforms`).then(function(exists) {
    if (!exists) {
      request(`${tarballUrl}/${stableVersion}/${kubernetesArchive}`)
          .pipe(source(`${kubernetesArchive}`))
          .pipe(gunzip())
          .pipe(untar())
          .pipe(filter)
          .pipe(chmod(755))
          .pipe(gulp.dest(conf.paths.base))
          .on('end', function() { doneFn(); });
    } else {
      doneFn();
    }
  });
});

/**
 * Removes kubernetes before git clone command.
 */
gulp.task('clear-kubernetes', function() { return del(conf.paths.kubernetes); });

/**
 * Spawns local-up-cluster.sh script.
 */
gulp.task(
    'spawn-cluster',
    [
      'checkout-kubernetes-version',
      'kubeconfig-set-cluster-local',
      'kubeconfig-set-context-local',
      'kubeconfig-use-context-local',
      'kill-cluster',
    ],
    function() {
      clusterProcess = childProcess.spawn(upScript, {stdio: 'inherit'});

      clusterProcess.on('exit', function(code) {
        if (code !== 0) {
          clusterSpawnFailure = code;
        }
        clusterProcess = null;
      });
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
      gulpUtil.log(
          gulpUtil.colors.magenta(
              `Waiting for a Kubernetes cluster on ${conf.backend.apiServerHost}...`));
    }
    counter += 1;

    checkForClusterFailure(doneFn);

    // constantly query the cluster until it is properly running
    clusterHealthCheck(function(result) {
      if (result === 'ok') {
        gulpUtil.log(gulpUtil.colors.magenta('Kubernetes cluster is up and running.'));
        clearTimeout(isRunningSetIntervalHandler);
        isRunningSetIntervalHandler = null;
        doneFn();
      }
    });
  }
});

/**
 * Sets a cluster entry in kubeconfig.
 * Configures kubernetes server for localhost.
 */
gulp.task(
    'kubeconfig-set-cluster-local', ['download-kubectl', 'checkout-kubernetes-version'],
    function(doneFn) {
      executeKubectlCommand(
          `config set-cluster local --server=http://${conf.backend.apiServerHost}` +
              `--insecure-skip-tls-verify=true`,
          doneFn);
    });

/**
 * Sets a context entry in kubeconfig as local.
 */
gulp.task(
    'kubeconfig-set-context-local', ['download-kubectl', 'checkout-kubernetes-version'],
    function(doneFn) {
      executeKubectlCommand('config set-context local --cluster=local', doneFn);
    });

/**
 * Sets the current-context in a kubeconfig file
 */
gulp.task(
    'kubeconfig-use-context-local', ['download-kubectl', 'checkout-kubernetes-version'],
    function(doneFn) { executeKubectlCommand('config use-context local', doneFn); });
