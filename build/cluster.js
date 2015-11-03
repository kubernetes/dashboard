// Copyright 2015 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Gulp tasks for kubernetes cluster management.
 */
import gulp from 'gulp';
import request from 'request';
import source from 'vinyl-source-stream';
import gunzip from 'gulp-gunzip';
import untar from 'gulp-untar';
import exec from 'gulp-exec';
import chmod from 'gulp-chmod';

let options = {
    continueOnError: false, // default = false, true means don't emit error event
    pipeStdout: false, // default = false, true means stdout is written to file.contents
};

let reportOptions = {
    err: true, // default = true, false means don't write err
    stderr: true, // default = true, false means don't write stderr
    stdout: true, // default = true, false means don't write stdout
};

let stable_version = 'v1.0.7',
    file = 'kubernetes.tar.gz',
    latest_url = 'https://storage.googleapis.com/kubernetes-release/release/stable.txt';


/**
 * Creates cluster from scratch.
 * Downloads latest version of kubernetes.
 * Execute script to up cluster.
 *
 */
gulp.task('create_cluster',['download_kubernete_release'], function () {

    return gulp.src('./kubernetes')
        .pipe(exec('KUBERNETES_PROVIDER=vagrant VAGRANT_DEFAULT_PROVIDER=libvirt ./kubernetes/cluster/kube-up.sh', options))
        .pipe(exec.reporter(reportOptions));
});

/**
 * Simple task for retrieving latest version of kubernetes.
 */
gulp.task('get_version', function (done) {

    request(latest_url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            stable_version = body.trim();
        }
        return done();
    });

});

/**
 * Downloads latest version of kubernetes.
 */
gulp.task('download_kubernete_release', function () {

    let release_url= 'https://storage.googleapis.com/kubernetes-release/release/'+ stable_version + '/' + file;

    return request(release_url)
        .pipe(source(file))
        .pipe(gunzip())
        .pipe(untar())
        .pipe(chmod(755))
        .pipe(gulp.dest('./'));

});

/**
 * Bring up a Kubernetes cluster.
 */
gulp.task('up_cluster', function() {

    return gulp.src('./kubernetes')
        .pipe(exec('KUBERNETES_PROVIDER=vagrant VAGRANT_DEFAULT_PROVIDER=libvirt ./kubernetes/cluster/kube-up.sh', options))
        .pipe(exec.reporter(reportOptions));
});

/**
 * Tear down a Kubernetes cluster.
 */
gulp.task('down_cluster', function() {

    return gulp.src('./kubernetes')
        .pipe(exec('KUBERNETES_PROVIDER=vagrant VAGRANT_DEFAULT_PROVIDER=libvirt ./kubernetes/cluster/kube-down.sh', options))
        .pipe(exec.reporter(reportOptions));
});