# Kubernetes Dashboard

[![Build Status](https://travis-ci.org/kubernetes/dashboard.svg?branch=master)](https://travis-ci.org/kubernetes/dashboard)
[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![Greenkeeper badge](https://badges.greenkeeper.io/kubernetes/dashboard.svg)](https://greenkeeper.io/)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![GitHub release](https://img.shields.io/github/release/kubernetes/dashboard.svg)](https://github.com/kubernetes/dashboard/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to manage applications running in the cluster and troubleshoot them, as well as manage the cluster itself.

![Dashboard UI workloads page](docs/dashboard-ui.png)

**IMPORTANT:** Frontend side of the project is currently undergoing migration from [AngularJS](https://angularjs.org/) to the current version of [Angular](https://angular.io/). If you are willing to contribute or you would like to check out early version of the application check [this pull request](https://github.com/kubernetes/dashboard/pull/2727).

## Getting Started

**IMPORTANT:** Read the [Access Control](
https://github.com/kubernetes/dashboard/wiki/Access-control) guide before performing any further steps. The default Dashboard deployment contains a minimal set of RBAC privileges needed to run.

To deploy Dashboard, execute following command:

```sh
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
```

To access Dashboard from your local workstation you must create a secure channel to your Kubernetes cluster. Run the following command:

```sh
$ kubectl proxy
```
Now access Dashboard at:

[`http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/`](
http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/).

## Create An Authentication Token (RBAC)
To find out how to create sample user and log in follow [Creating sample user](https://github.com/kubernetes/dashboard/wiki/Creating-sample-user) guide.

**NOTE:**
* Kubeconfig Authentication method does not support external identity providers or certificate-based authentication. 
* Dashboard can only be accessed over HTTPS
* [Heapster](https://github.com/kubernetes/heapster/) has to be running in the cluster for the metrics
and graphs to be available. Read more about it in [Integrations](
https://github.com/kubernetes/dashboard/wiki/Integrations) guide.

## Documentation

Dashboard documentation can be found on [Wiki](https://github.com/kubernetes/dashboard/wiki) pages, it includes:

* Common: Entry-level overview
* User Guide: [Installation](https://github.com/kubernetes/dashboard/wiki/Installation), [Accessing Dashboard](
https://github.com/kubernetes/dashboard/wiki/Accessing-dashboard) and more for users
* Developer Guide: [Getting Started](https://github.com/kubernetes/dashboard/wiki/Getting-started), [Dependency
Management](https://github.com/kubernetes/dashboard/wiki/Dependency-management) and more for anyone interested in
contributing

## Community

* [**#sig-ui on Kubernetes Slack**](https://kubernetes.slack.com)
* [**kubernetes-sig-ui mailing list** ](https://groups.google.com/forum/#!forum/kubernetes-sig-ui)
* [**GitHub issues**](https://github.com/kubernetes/dashboard/issues)
* [**community info**](https://github.com/kubernetes/community/tree/master/sig-ui)

## License

[Apache License 2.0](https://github.com/kubernetes/dashboard/blob/master/LICENSE)
