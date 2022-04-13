# Code conventions

## Backend

We are following conventions described in [Effective Go](https://golang.org/doc/effective_go.html) document.

Go to our [Go Report Card](https://goreportcard.com/report/github.com/kubernetes/dashboard) to check how well we are doing.

## Frontend

We are following conventions described in [Angular Style Guide](https://angular.io/guide/styleguide) and [Material Design Guidelines](https://material.io/guidelines/).

Additionally, check the list of rules and tips, that we are using:

* Private method and variable names should end with a `_`.
* In order to keep all tooltips consistent across whole application, we have decided to use 500 ms delay and auto-hide option. It allows us to avoid flickering when moving the mouse over the pages and to hide tooltips after the mouse is elsewhere but the focus is still on the element with tooltip.

An overview of the features provided by the dashboard can be found [here](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard).

## Code Style

The code style check suite includes format checks can be executed with:

```shell
make check
```

The code formatting can be executed with:

```shell
make fix
```

These check and formatting involves in go, ts, scss, html, license and i18n files.

We use following tools and settings for each check and formatting:

| code    | tools                                                                  | setting                                                                               |
|---------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| go      | [golangci-lint](https://github.com/golangci/golangci-lint)             | [`.golangci.yml`](../../.golangci.yml)                                                |
| ts      | [gts](https://github.com/google/gts)                                   | [`.eslintrc.yaml`](../../.eslintrc.yaml) and [`.prettierrc.js`](../../.prettierrc.js) |
| scss    | [stylelint](https://github.com/stylelint/stylelint)                    | [`.stylelintrc.yaml`](../../.stylelintrc.yaml)                                        |
| html    | [prettier](https://prettier.io/)                                       | [`.jsbeautifyrc`](../../.jsbeautifyrc)                                                |
| license | [license-check-and-add](https://github.com/awjh/license-check-and-add) | [`license-checker-config.json`](../../license-checker-config.json)                    |
| i18n    | [xliffmerge](https://github.com/martinroob/ngx-i18nsupport)            | `xliffmergeOptions` in [`package.json`](../../package.json)                           |

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
