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
import git from 'gulp-git';
import gulpUtil from 'gulp-util';
import wait from 'gulp-wait';
import runSquence from 'run-sequence';

import conf from './conf';


let clusterIsRunning = false,
    etcdPath,
    exec = childProcess.exec,
    goPath,
    kubernetesUrl = 'https://github.com/kubernetes/kubernetes.git',
    logFile = '/tmp/dashboard-cluster.log',
    stableVersion = 'v1.1.1',
    upScript = `${conf.paths.kubernetes}/hack/local-up-cluster.sh`,
    waitForCluster = 20000;


/**
 * Creates cluster from scratch.
 * Downloads latest version of kubernetes from git repository.
 * Checkouts for latest release.
 * Executes script to up cluster.
 * Configures cluster locally.
 * When cluster is created just use tasks up-cluster and down-cluster to start/stop it.
 * Prerequisites:
 *  * Install Docker for your OS
 *  * Install golang
 *  * Install etcd
 */
gulp.task('create-cluster', function () {
    return runSquence('download-kubernetes-release', 'checkout-kubernetes-version');

});


/**
 * Brings up a Kubernetes cluster.
 */
gulp.task('up-cluster', function () {
    return runSquence('down-cluster', 'get-go-path', 'get-etcd-path', 'run-up-script', 'wait-for-cluster',
        'check-cluster', 'config-set-cluster-local', 'config-set-context-local',
        'config-use-context-local'
    );
});


/**
 * Tears down a Kubernetes cluster.
 */
gulp.task('down-cluster', function (doneFn) {
    exec(`sudo killall local-up-cluster.sh; sudo rm ${logFile}`,
        function () {
            return doneFn();
        });
});


/**
 * Downloads latest released version of kubernetes from git repository.
 */
gulp.task('download-kubernetes-release', ['clear-kubernetes'], function (doneFn) {

    git.clone(kubernetesUrl, {args: conf.paths.kubernetes}, function (err) {
        if (err)
            return doneFn(new Error(err));
        return doneFn();
    });
});


/**
 * Removes kubernetes before git clone command.
 */
gulp.task('clear-kubernetes', function (doneFn) {
    return exec(`sudo -E rm -rf ${conf.paths.kubernetes}`,
        function (err, stdout) {
            if (err)
                return doneFn(new Error(err));
            console.log(stdout);
            return doneFn();
        });
});


/**
 * Checkouts kubernetes to latest stable version.
 */
gulp.task('checkout-kubernetes-version', function (doneFn) {
    git.checkout(stableVersion, {cwd: conf.paths.kubernetes, quiet: true}, function (err) {
        if (err)
            return doneFn(new Error(err));
        return doneFn();
    });
});


/**
 * Builds kubernetes from sources.
 */
gulp.task('build-kubernetes', function (doneFn) {
    exec(`cd ${conf.paths.kubernetes}; make clean; make quick-release`,
        function (err, stdout) {
            if (err)
                return doneFn(new Error(err));
            console.log(stdout);
            return doneFn();
        });
});


/**
 * Retrieves go installation path.
 */
gulp.task('get-go-path', function (doneFn) {
    let goNameLength = "/go".length;
    exec(`which go`,
        function (err, stdout) {
            if (err)
                return doneFn(new Error(err));
            goPath = stdout.trim();
            if (goPath.length > goNameLength)
                goPath = goPath.substring(0, goPath.length - goNameLength);
            return doneFn();
        });
});


/**
 * Retrieves etcd installation path.
 */
gulp.task('get-etcd-path', function (doneFn) {
    let etcdNameLength = "/etcd".length;
    exec(`which etcd`,
        function (err, stdout) {
            if (err)
                return doneFn(new Error(err));
            etcdPath = stdout.trim();
            if (etcdPath.length > etcdNameLength)
                etcdPath = etcdPath.substring(0, etcdPath.length - etcdNameLength);
            return doneFn();
        });
});


/**
 * Runs local-up-cluster.sh script as root.
 */
gulp.task('run-up-script', function (doneFn) {
    exec(`sudo -E bash -c 'export PATH=${goPath}:${etcdPath}:$PATH;
                            nohup ${upScript} > ${logFile} 2>&1 &'`,
        function (err) {
            if (err)
                return doneFn(new Error(err));
            return doneFn();
        });
});


/**
 * Checks if cluster is running correctly.
 */
gulp.task('check-cluster', function () {
    return gulp.src(logFile)
        .pipe(gulpUtil.buffer(function (err, files) {
            if (files.length === 1) {
                let tmp = files[0];
                let content = tmp._contents.toString();
                gulpUtil.log(content);
                if (content.indexOf('Local Kubernetes cluster is running.') >= 0) {
                    clusterIsRunning = true;
                    gulpUtil.log('Cluster is up and running');
                } else {
                    clusterIsRunning = false;
                    gulpUtil.log(
                        gulpUtil.colors.magenta(
                            `Cluster started with errors. See ${logFile} to get more info.`));
                }
            }
        }));
});


/**
 * Waits some time to be sure that cluster is up and running.
 * It's required because script is running in background process.
 */
gulp.task('wait-for-cluster', function () {
    return gulp.src(logFile)
        .pipe(wait(waitForCluster));
});


/**
 * Sets a cluster entry in kubeconfig.
 * Configures kubernetes server for localhost.
 */
gulp.task('config-set-cluster-local', function (doneFn) {
    if (clusterIsRunning) {
        exec(`${conf.paths.kubernetes}/cluster/kubectl.sh config set-cluster local `
            + `--server=http://127.0.0.1:8080 --insecure-skip-tls-verify=true`,
            function (err) {
                if (err)
                    return doneFn(new Error(err));
            });
    } else {
        gulpUtil.log(gulpUtil.colors.magenta('Skipped'));
    }
    return doneFn();
});


/**
 * Sets a context entry in kubeconfig as local.
 */
gulp.task('config-set-context-local', function (doneFn) {
    if (clusterIsRunning) {
        exec(`${conf.paths.kubernetes}/cluster/kubectl.sh config set-context local --cluster=local`,
            function (err) {
                if (err)
                    return doneFn(new Error(err));
            });
    } else {
        gulpUtil.log(gulpUtil.colors.magenta('Skipped'));
    }
    return doneFn();
});


/**
 * Sets the current-context in a kubeconfig file
 */
gulp.task('config-use-context-local', function (doneFn) {
    if (clusterIsRunning) {
        exec(`${conf.paths.kubernetes}/cluster/kubectl.sh config use-context local`,
            function (err) {
                if (err)
                    return doneFn(new Error(err));
            });
    } else {
        gulpUtil.log(gulpUtil.colors.magenta('Skipped'));
    }
    return doneFn();
});
