This document describes how to setup your development environment.

## Preparation

Make sure the following software is installed and added to the `$PATH` variable:

* Docker 1.10+ ([installation manual](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/))
* Golang 1.8+ ([installation manual](https://golang.org/dl/))
* Node.js 8+ and npm 5+ ([installation with nvm](https://github.com/creationix/nvm#usage))
* Java 7+ ([installation manual](http://openjdk.java.net/install/))
* Gulp.js 3.9+ ([installation manual](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#install-the-gulp-command))

Clone the repository into `$GOPATH/kubernetes/dashboard` and install the dependencies:

```shell
$ npm i
```

If you are running commands with root privileges set `--unsafe-perm` flag:

 ```shell
 npm i --unsafe-perm
 ```

## Running the cluster

To make Dashboard work you need to have cluster running. If you would like to use local cluster we recommend [kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/), [minikube](https://kubernetes.io/docs/getting-started-guides/minikube/) or [kubeadm-dind-cluster](https://github.com/Mirantis/kubeadm-dind-cluster). The most convenient way is to make it work is to create a proxy. Run the following command:

```shell
$ kubectl proxy --port=8080
```

kubectl will handle authentication with Kubernetes and create an API proxy with the address
`localhost:8080`. Therefore, no changes in the configuration are required.

Another way to connect to real cluster while developing dashboard is to override default values used
by our build pipeline. In order to do that we have introduced two environment variables
`KUBE_DASHBOARD_APISERVER_HOST` and `KUBE_DASHBOARD_KUBECONFIG` that will be used over default ones when
defined. Before running our gulp tasks just do:

```shell
$ export KUBE_DASHBOARD_APISERVER_HOST="http://<APISERVER_IP>:<APISERVER_PORT>"
# or
$ export KUBE_DASHBOARD_KUBECONFIG="<KUBECONFIG_FILE_PATH>"
```

**NOTE: Environment variable `KUBE_DASHBOARD_KUBECONFIG` has higher priority than `KUBE_DASHBOARD_APISERVER_HOST`.**

## Serving Dashboard for Development

It is easy to compile and run Dashboard. Open a new tab in your terminal and type:

```shell
$ gulp serve
```

Open a browser and access the UI under `localhost:9090`. A lot of things happened underneath.
Let's scratch on the surface a bit.

Compilation:
* Stylesheets are implemented with SASS and compiled to CSS with libsass
* JavaScript is implemented in ES6. It is compiled with Babel for development and the
  Google-Closure-Compiler for production.
* Go is used for the implementation of the backend. The source code gets compiled into the
  single binary 'dashboard'


Execution:
* Frontend is served by BrowserSync. It enables features like live reloading when
  HTML/CSS/JS change and even synchronize scrolls, clicks and form inputs across multiple devices.
* Backend is served by the 'dashboard' binary.

File watchers listen for source code changes (CSS, JS, GO) and automatically recompile.
All changes are instantly reflected, e.g. by automatic process restarts or browser refreshes.
The build artifacts are created in a hidden folder (`.tmp`).

After successful execution of `gulp local-up-cluster` and `gulp serve`, the following processes
should be running (respective ports are given in parentheses):

BrowserSync (9090)  ---> Dashboard backend (9091)  ---> Kubernetes API server (8080)

## Building Dashboard for production

The Dashboard project can be built for production by using the following task:

```shell
$ gulp build
```

The code is compiled, compressed and debug support removed. The artifacts can be found
in the `dist` folder.

In order to serve Dashboard from the `dist` folder, use the following task:

```shell
$ gulp serve:prod
```

Open a browser and access the UI under `localhost:9090.` The following processes should
be running (respective ports are given in parentheses):


Dashboard backend (9090)  ---> Kubernetes API server (8080)



In order to package everything into a ready-to-run Docker image, use the following task:

```shell
$ gulp docker-image:head
```

You might notice that the Docker image is very small and requires only a few MB. Only
Dashboard assets are added to a scratch image. This is possible, because the `dashboard`
binary has no external dependencies. Awesome!

## Run the tests

Unit tests should be executed after every source code change. The following task makes this
a breeze by automatically executing the unit tests after every save action.

```shell
$ gulp test:watch
```

The full test suite includes static code analysis, unit tests and integration tests.
It can be executed with:

```shell
$ gulp check
```

By the way, the test can run alone, such as integration and javascript-format test (it can help you focus primary problem).

```shell
$ gulp integration-test:prod
$ gulp check-javascript-format
```

## Committing changes to your fork

Before committing any changes, please link/copy the pre-commit hook into your .git directory. This will keep you from accidentally committing non formatted code.

The hook requires goimports to be in your PATH.

```shell
cd <dashboard_home>/.git/hooks/
ln -s ../../hooks/pre-commit .
```

Then you can commit your changes and push them to your fork:

```shell
git commit
git push -f origin my-feature
```

## Building dashboard inside a container

It's possible to run `gulp` and all the dependencies inside a development container. To do this,
just replace `gulp [some arg]` commands with `build/run-gulp-in-docker.sh [some arg]` (e.g. `build/run-gulp-in-docker.sh serve`). If you
do this, the only dependency is `docker`, and required commands such as `npm install`
will be run automatically.