# Development

## Architecture

The Kubernetes Dashboard consists of a few main modules:

- API — Stateless Go module, which could be referred to as a Kubernetes API extension. It provides functionalities like:
  - Aggregation (i.e., returning metrics and events for pods)
  - Sorting
  - Filtering
  - Pagination
- Auth — Go module handling authentication to the Kubernetes API.  
- Web — Module containing web application written in Angular and Go server with some web-related logic (i.e., settings). Its main task is presenting data fetched from Kubernetes API through API module.
- Metrics Scraper — Go module used to scrape and store a small window of metrics fetched from the Kubernetes Metrics Server.

## Code Conventions

When writing new Go code, we try to follow conventions described in [Effective Go](https://golang.org/doc/effective_go.html).  We are using [Go Report Card](https://goreportcard.com/report/github.com/kubernetes/dashboard) to monitor how well we are doing.

For Angular, we try to follow conventions described in [Angular Style Guide](https://angular.io/guide/styleguide) and [Material Design Guidelines](https://material.io/guidelines/).

We are running a set of checks for each pull request, all of them have to be successful before the change can be merged. You can run most of them locally using `make` targets, i.e. `make test` or `make check` (see [`Makefile`](Makefile) for more information).

Tools that we are using include [golangci-lint](https://github.com/golangci/golangci-lint), [eslint](https://eslint.org), [stylelint](https://github.com/stylelint/stylelint), [prettier](https://prettier.io/).

## Development Environment

Make sure the following software is installed and added to your path:

- [Docker](https://docs.docker.com/engine/install/) 
- [Go](https://golang.org/dl/) (check the required version in [`modules/go.work`](modules/go.work))
- [Node.js](https://nodejs.org/en/download) (check the required version in [`modules/web/package.json`](modules/web/package.json))
- [Yarn](https://yarnpkg.com/getting-started/install) (check the required version in [`modules/web/.yarnrc.yml`](modules/web/.yarnrc.yml))

## Getting Started

After cloning the repository, install web dependencies with `cd modules/web && yarn`.

Then you can start the development version of the application with `make serve` It will create local kind cluster and run all the modules with Docker compose.

If you would like to run production version of the application use `make run`.

To run a full end-to-end test use `make helm`. It will:
- spin up a local kind dev cluster and expose 443 port (make sure that this port is free on your host)
- install ingress-nginx for kind
- update local helm dependencies
- build all production ready docker images
- load built images into the kind dev cluster
- install Kubernetes Dashboard via helm chart inside kind dev cluster

Kubernetes Dashboard should be then available directly on your localhost: https://localhost

To create Docker images locally use `make image`.

See [`Makefile`](Makefile) to get to know other targets useful during development. You can also run `make help` to quickly check the list of available commands.

## Dependency Management

We keep all the dependencies outside the repository and always try to avoid using suspicious, unknown dependencies as they may introduce vulnerabilities.

We use [go mod](https://github.com/golang/go/wiki/Modules) to manage Go dependencies. We try to use only official releases, avoid using specific or latest commits. Before sending any changes we run `go mod tidy` to remove unused dependencies.

We use [Yarn](https://yarnpkg.com/) to manage JavaScript dependencies. After checking out repository, run `yarn` to install all dependencies.

Additionally, we use [Dependabot](https://github.com/dependabot) to automate dependency updates.


## Releases

We follow [semver](https://semver.org/) versioning scheme for versioning releases of app and all of its modules.

Each module described in the [Architecture section](#architecture) has its own releases and versions. After testing everything on a production version of application, i.e., using `make run`, new release can be created. For modules described above we create tag and the release with module name and its version in it, i.e.`api/v1.0.0` or `web/v2.4.5`. After a new tag is created, new images should be built by GitHub actions.

We also create application releases by releasing a new version of Helm chart that uses modules described before. After applying all the changes to the chart and testing it on a Kubernetes cluster a new tag and the release can be created. For application releases we put only the version in the tag and release name, i.e. `v3.0.0`. This release should include detailed description including release notes, compatibility matrix and all other important information.
