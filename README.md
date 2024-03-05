# Kubernetes Dashboard

[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

## Introduction

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to manage applications running in the cluster and troubleshoot them, as well as manage the cluster itself.

![Dashboard UI workloads page](docs/images/overview.png)

## Getting Started

**IMPORTANT:** Read the [Access Control](docs/user/access-control/README.md) guide before performing any further steps. The default Dashboard deployment contains a minimal set of RBAC privileges needed to run.

## Installation

Kubernetes Dashboard supports both Helm and Manifest-based installation. Since release `v3.0.0` using Helm Chart should be faster and simpler in general as it will install
dependencies such as `cert-manager`, `nginx-ingress-controller` and `metrics-server` for you. In case you are using different software to handle certificates, ingress/egress traffic, etc.
it is possible to disable those dependencies by overriding [helm chart values](charts/kubernetes-dashboard/values.yaml).

### Helm

You can install Dashboard using Helm as described [here](https://artifacthub.io/packages/helm/k8s-dashboard/kubernetes-dashboard).

### Manifest

You can install Dashboard using `kubectl` as described in the installation instructions that can be found in the [latest release](https://github.com/kubernetes/dashboard/releases/latest).

## Access

You can access Dashboard as described in the instructions that can be found in the [access guide](docs/user/accessing-dashboard/README.md).

## Create An Authentication Token (RBAC)
To find out how to create sample user and log in follow [Creating sample user](docs/user/access-control/creating-sample-user.md) guide.

**NOTE:**
* Kubeconfig Authentication method does not support external identity providers or certificate-based authentication.
* [Metrics-Server](https://github.com/kubernetes-sigs/metrics-server) has to be running in the cluster for the metrics and graphs to be available. Read more about it in [Integrations](docs/user/integrations.md) guide.

## Documentation

Dashboard documentation can be found on [docs](docs/README.md) directory which contains:

* [Common](docs/common/README.md): Entry-level overview.
* [User Guide](docs/user/README.md): [Accessing Dashboard](docs/user/accessing-dashboard/README.md) and more for users.
* [Developer Guide](docs/developer/README.md): Important information for contributors that would like to test, run and work on Dashboard locally.

## Community, discussion, contribution, and support

Learn how to engage with the Kubernetes community on the [community page](http://kubernetes.io/community/).

You can reach the maintainers of this project at:

* [**#sig-ui on Kubernetes Slack**](https://kubernetes.slack.com)
* [**kubernetes-sig-ui mailing list** ](https://groups.google.com/forum/#!forum/kubernetes-sig-ui)
* [**Issue tracker**](https://github.com/kubernetes/dashboard/issues)
* [**SIG info**](https://github.com/kubernetes/community/tree/master/sig-ui)
* [**Roles**](ROLES.md)

### Contribution

Learn how to start contributing to the [Contributing Guideline](CONTRIBUTING.md).

### Code of conduct

Participation in the Kubernetes community is governed by the [Kubernetes Code of Conduct](code-of-conduct.md).

## License

[Apache License 2.0](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
