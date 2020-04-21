# Getting started

This document describes how to setup your development environment.

## Preparation

Make sure the following software is installed and added to the $PATH variable:

* Curl 7+
* Git 2.13.2+
* Docker 1.13.1+ ([installation manual](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/))
* Golang 1.13.9+ ([installation manual](https://golang.org/dl/))
    * Dashboard uses `go mod` for go dependency management, so enable it with running `export GO111MODULE=on`.
* Node.js 12+ and npm 6+ ([installation with nvm](https://github.com/creationix/nvm#usage))
* Gulp.js 4+ ([installation manual](https://github.com/gulpjs/gulp/blob/master/docs/getting-started/1-quick-start.md))

Clone the repository into `$GOPATH/src/github.com/kubernetes/dashboard` and install the dependencies:

```
npm ci
```

If you are running commands with root privileges set `--unsafe-perm flag`:

```
npm ci --unsafe-perm
```

## Running the cluster

To make Dashboard work you need to have cluster running. If you would like to use local cluster we recommend [kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/), [minikube](https://kubernetes.io/docs/getting-started-guides/minikube/) or [kubeadm-dind-cluster](https://github.com/Mirantis/kubeadm-dind-cluster). The most convenient way is to make it work is to create a proxy. Run the following command:

```
kubectl proxy
```

kubectl will handle authentication with Kubernetes and create an API proxy with the address `localhost:8080`. Therefore, no changes in the configuration are required.

Another way to connect to real cluster while developing dashboard is to override default values used by our build pipeline. In order to do that we have introduced two environment variables `KUBE_DASHBOARD_APISERVER_HOST` and `KUBE_DASHBOARD_KUBECONFIG` that will be used over default ones when defined. Before running our npm tasks just do:

```
export KUBE_DASHBOARD_APISERVER_HOST="http://<APISERVER_IP>:<APISERVER_PORT>"
```
or
```
export KUBE_DASHBOARD_KUBECONFIG="<KUBECONFIG_FILE_PATH>"
```

**NOTE: Environment variable `KUBE_DASHBOARD_KUBECONFIG` has higher priority than `KUBE_DASHBOARD_APISERVER_HOST`.**

## Serving Dashboard for Development

Quick updated version:

```
npm start
```

Open a browser and access the UI under `localhost:8080`.

In the background, `npm start` makes a [concurrently](https://github.com/kimmobrunfeldt/concurrently#readme) call to start the `golang` backend server and the `angular` development server.

Once the angular server starts, it takes some time to pre-compile all assets before serving them. By default, the angular development server watches for file changes and will update accordingly.

## Building Dashboard for production

To build dashboard for production, you still need to install `bc`.

The Dashboard project can be built for production by using the following task:

```
npm run build
```

The code is compiled, compressed and debug support removed. The dashboard binary can be found in the `dist` folder.

To build and immediately serve Dashboard from the `dist` folder, use the following task:

```
npm run start:prod
```

Open a browser and access the UI under `localhost:9090`. The following processes should be running (respective ports are given in parentheses):

`Dashboard backend (9090) ---> Kubernetes API server (8080)`

To build the docker image on darwin OS you will need to set environment variable for go to build as linux:

```
export GOOS=linux
```

In order to package everything into a ready-to-run Docker image, use the following task:

```
npm run docker:build:head
```

You might notice that the Docker image is very small and requires only a few MB. Only Dashboard assets are added to a scratch image. This is possible, because the `dashboard` binary has no external dependencies. Awesome!

## Run the tests

Unit tests should be executed after every source code change. The following task makes this a breeze. The full test suite includes unit tests and integration tests.

```
npm run test
```

You can also run individual tests on their own (such as the backend or frontend tests) by doing the following:

```
npm run test:frontend
```
or
```
npm run test:backend
```

The code style check suite includes format checks can be executed with:

```
npm run check
```

The code formatting can be executed with:

```
npm run fix
```

These check and formatting involves in go, ts, scss, html, license and i18n files.

## Committing changes to your fork

Before committing any changes, please run `npm run check`. This will keep you from accidentally committing non tested and unformatted code.

Since the hooks for commit has been set with `husky` into `<dashboard_home>/.git/hooks/pre-commit` already if you installed dashboard according to above, so it will run `npm run fix` and keep your code as formatted.

Then you can commit your changes and push them to your fork:

```
git commit
git push -f origin my-feature
```

## Easy way to build your development environment with Docker

At first, change directory to kubernetes dashboard repository of your fork.

### Allow accessing dashboard from outside the container

Development container runs Kubernetes Dashboard in insecure mode by default,
but Kubernetes Dashboard is not exposed to outside the container in insecure
mode by default.

To allow accessing dashboard from outside the development container,
pass value for `--insecure-bind-address` option to dashboard as follows:

* Set `K8S_DASHBOARD_BIND_ADDRESS` environment variable as `"0.0.0.0"` before using `aio/develop/run-npm-on-container.sh`.
* Run like `npm run [command] --kubernetes-dashboard:bind_address="0.0.0.0"`, when you run dashboard from inside the container.

### Change port number for dashboard

As default, development container uses `8080` port to expose dashboard. If you need to change the port number, set `K8S_DASHBOARD_PORT` environment variable before using `aio/develop/run-npm-on-container.sh`. The variable would be passed to `--port` option for docker and `npm run start` command inside container, then container exports the port and dashboard starts at the port.

### To run dashboard using Docker at ease

1. Run `aio/develop/run-npm-on-container.sh`.

That's all. It will build dashboard container from your local repository, will create also kubernetes cluster container for your dashboard using [`kind`](https://github.com/kubernetes-sigs/kind), and will run dashboard.
Then you can see dashboard `http://localhost:8080` with your browser.

### To run with your another Kubernetes cluster

1. Copy kubeconfig from your cluster, and confirm the URL for API server in it, and modify it if necessary.
2. Set filepath for kubeconfig into `K8S_DASHBOARD_KUBECONFIG` environment variable.
3. If you deployed `dashboard-metrics-scraper` in your cluster, set its endpoint to `K8S_DASHBOARD_SIDECAR_HOST` environment variable.
4. Change directory into your dashboard source directory.
5. Run `aio/develop/run-npm-on-container.sh`.

These manipulations will build container, and run dashboard as default.

### To run npm commands as you want

Also, you can run npm commands described in package.json as you want

e.g.
1. To test dashboard, run `aio/develop/run-npm-on-container.sh run test`.
2. To check your code changes, run `aio/develop/run-npm-on-container.sh run check`.

This container create `user` with `UID` and `GID` same as local user, switch user to `user` with `gosu` and run commands. So created or updated files like results of `npm run fix` or `npm run build` would have same ownership as your host. You can commit them immediately from your host.

### To run container without creating cluster and running dashboard

1. Set `K8S_DASHBOARD_CMD` environment variable as `bash`.
2. Run `aio/develop/run-npm-on-container.sh`.
3. Run commands as you like in the container.

This runs container with `bash` command.

### To access console inside of running development container

1. Run `docker exec -it k8s-dashboard-dev gosu user bash`.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
