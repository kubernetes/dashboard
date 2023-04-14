# Getting started

This document describes how to setup your development environment.

## Preparation

Make sure the following software is installed and added to the `$PATH` variable:

* Curl 7+ ([installation](https://curl.se/docs/install.html))
* Git 2.13.2+ ([installation](https://git-scm.com/downloads))
* Docker 23.0.1+ ([installation](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/))
* Golang 1.19+ ([installation](https://golang.org/dl/))
  * We use `go mod` for go dependency management
* Node.js 18.14.0+ ([installation](https://nodejs.org/en/download))
* Yarn 2+ ([installation](https://yarnpkg.com/getting-started/install))

Clone the repository and install the dependencies:

```shell
make --directory modules/common/tools install
yarn
```

## Running the cluster

To make Dashboard work you need to have cluster running. If you would like to use local cluster we recommend [kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/), [minikube](https://kubernetes.io/docs/getting-started-guides/minikube/) or [kubeadm-dind-cluster](https://github.com/Mirantis/kubeadm-dind-cluster). The most convenient way is to make it work is to create a proxy. Run the following command:

```shell
kubectl proxy
```

kubectl will handle authentication with Kubernetes and create an API proxy with the address `localhost:8080`. Therefore, no changes in the configuration are required.

## Serving Dashboard for Development

Quick updated version:

```shell
npm start
```

Another way to connect to real cluster while developing dashboard is to specify options for `npm` like following:

```shell
npm run start:https --kubeconfig=<path to your kubeconfig>
```

Please see [here](https://github.com/kubernetes/dashboard/blob/master/.npmrc) which options you can specify to run dashboard with `npm`.

Open a browser and access the UI under `localhost:8080`.

In the background, `npm start` makes a [concurrently](https://github.com/open-cli-tools/concurrently) call to start the `golang` backend server and the `angular` development server.

Once the angular server starts, it takes some time to pre-compile all assets before serving them. By default, the angular development server watches for file changes and will update accordingly.

As stated in the [Angular documentation](https://angular.io/guide/i18n#generate-app-versions-for-each-locale), i18n does not work in the development mode.
Follow [Building Dashboard for Production](#building-dashboard-for-production) section to test this feature.

> Due to the deployment complexities of i18n and the need to minimize rebuild time, the development server only supports localizing a single locale at a time. Setting the "localize" option to true will cause an error when using ng serve if more than one locale is defined. Setting the option to a specific locale, such as "localize": ["fr"], can work if you want to develop against a specific locale (such as fr).

## Building Dashboard for Production

To build dashboard for production, you still need to install `bc`.

The Dashboard project can be built for production by using the following task:

```shell
make build
```

The code is compiled, compressed, i18n support is enabled and debug support removed. The dashboard binary can be found in the `dist` folder.

To build and immediately serve Dashboard from the `dist` folder, use the following task:

```shell
make prod
```

Open a browser and access the UI under `localhost:9090`. The following processes should be running (respective ports are given in parentheses):

`Dashboard backend (9090) ---> Kubernetes API server (8080)`

To build the Docker image on darwin OS you will need to set environment variable for go to build as linux:

```shell
export GOOS=linux
```

In order to package everything into a ready-to-run Docker image, use the following task:

```shell
make docker-build-head
```

You might notice that the Docker image is very small and requires only a few MB. Only Dashboard assets are added to a scratch image. This is possible, because the `dashboard` binary has no external dependencies. Awesome!

## Run the tests

Unit tests should be executed after every source code change. The following task makes this a breeze. The full test suite includes unit tests and integration tests.

```shell
make test
```

You can also run individual tests on their own (such as the backend or frontend tests) by doing the following:

```shell
make test-backend
make test-frontend
```

The code style check suite includes format checks can be executed with:

```shell
make check
```

The code formatting can be executed with:

```shell
make fix
```

These check and formatting involves in go, ts, scss, html, license and i18n files.

## Committing changes to your fork

Before committing any changes, please run `make fix`. This will keep you from accidentally committing non tested and unformatted code.

Since the hooks for commit has been set with `husky` into `<dashboard_home>/.git/hooks/pre-commit` already if you installed dashboard according to above, so it will run `make fix` and keep your code as formatted.

Then you can commit your changes and push them to your fork:

```shell
git commit
git push -f origin my-feature
```

## Easy way to build your development environment with Docker

At first, change directory to kubernetes dashboard repository of your fork.
This development container has all of dependencies to develop dashboard.

### Miscellaneous

* Development container builds Kubernetes Dashboard and runs it with self-certificates by default.
* This container create `user` with `UID` and `GID` same as local user, switch user to `user` with `gosu` and run commands. So created or updated files like results of `make fix` would have same ownership as your host. You can commit them immediately from your host.
* Built Kubernetes Dashboard will run by `docker compose`, so other few containers will be created in your docker.
* A Docker network called `kubernetes-dashboard` will be created by our script and all these containers will be assigned to it.

### To run dashboard using Docker at ease

1. Run `hack/develop/run-dev-container.sh`.

That's all. It will build dashboard container from your local repository, will create also kubernetes cluster container for your dashboard using [`kind`](https://github.com/kubernetes-sigs/kind), and will run dashboard.
Then you can see dashboard <http://localhost:4443> with your browser. Since dashboard uses self-certificates, so you need ignore warning or error about it in your browser.

### To run with your Kubernetes cluster

1. Copy kubeconfig from your cluster, and confirm the URL for API server in it, and modify it if necessary.
2. Set filepath for kubeconfig into `KD_DEV_KUBECONFIG` environment variable.
3. If you deployed `dashboard-metrics-scraper` in your cluster, set its endpoint to `KD_DEV_SIDECAR_HOST` environment variable.
4. Change directory into your dashboard source directory.
5. Run `hack/develop/run-dev-container.sh`.

These manipulations will build container and run dashboard with `make run` as default.

To accessing Kubernetes Dashboard, open <https://localhost:4443> from your browser.

### Just to run development container without building and running dashboard

1. Set `KD_DEV_CMD` environment variable as `bash`.
2. Run `hack/develop/run-dev-container.sh`.
3. Run commands as you like in the container.

This runs container and execute `bash` command interactively. Then, develop Kubernetes Dashboard!

* To run dashboard, execute `make run`. This will build dashboard for production and run three containers for the dashboard.
  Then, access <https://localhost:4443> from your browser.
* To run dashboard with Angular Live Development Server, execute `KUBECONFIG=/home/user/.kube/config make serve`.
  Then, access <http://localhost:8080> from your browser.

### To access console inside of running development container

1. Run `docker exec -it k8s-dashboard-dev gosu user bash`.

---

_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
