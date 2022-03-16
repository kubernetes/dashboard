# Kubernetes Dashboard

[![Continuous Integration](https://github.com/kubernetes/dashboard/workflows/Continuous%20Integration/badge.svg)](https://github.com/kubernetes/dashboard/actions?query=workflow%3A%22Continuous+Integration%22)
[![Continuous Deployment](https://github.com/kubernetes/dashboard/workflows/Continuous%20Deployment/badge.svg)](https://github.com/kubernetes/dashboard/actions?query=workflow%3A%22Continuous+Deployment%22)
[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![GitHub release](https://img.shields.io/github/release/kubernetes/dashboard.svg)](https://github.com/kubernetes/dashboard/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to manage applications running in the cluster and troubleshoot them, as well as manage the cluster itself.

![Dashboard UI workloads page](docs/images/dashboard-ui.png)

## Getting Started

**IMPORTANT:** Read the [Access Control](docs/user/access-control/README.md) guide before performing any further steps. The default Dashboard deployment contains a minimal set of RBAC privileges needed to run.

### Install

To deploy Dashboard, execute following command:

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml
```

Alternatively, you can install Dashboard using Helm as described at [`https://artifacthub.io/packages/helm/k8s-dashboard/kubernetes-dashboard`](https://artifacthub.io/packages/helm/k8s-dashboard/kubernetes-dashboard).

### Access

To access Dashboard from your local workstation you must create a secure channel to your Kubernetes cluster. Run the following command:

```shell
kubectl proxy
```
Now access Dashboard at:

[`http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/`](
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/).

## Create An Authentication Token (RBAC)
To find out how to create sample user and log in follow [Creating sample user](docs/user/access-control/creating-sample-user.md) guide.

**NOTE:**
* Kubeconfig Authentication method does not support external identity providers or certificate-based authentication.
* [Metrics-Server](https://github.com/kubernetes-sigs/metrics-server) has to be running in the cluster for the metrics and graphs to be available. Read more about it in [Integrations](docs/user/integrations.md) guide.

## Documentation

Dashboard documentation can be found on [docs](docs/README.md) directory which contains:

* [Common](docs/common/README.md): Entry-level overview.
* [User Guide](docs/user/README.md): [Installation](docs/user/installation.md), [Accessing Dashboard](docs/user/accessing-dashboard/README.md) and more for users.
* [Developer Guide](docs/developer/README.md): [Getting Started](docs/developer/getting-started.md), [Dependency Management](docs/developer/dependency-management.md) and more for anyone interested in contributing.

## Community, discussion, contribution, and support

Learn how to engage with the Kubernetes community on the [community page](http://kubernetes.io/community/).

You can reach the maintainers of this project at:

* [**#sig-ui on Kubernetes Slack**](https://kubernetes.slack.com)
* [**kubernetes-sig-ui mailing list** ](https://groups.google.com/forum/#!forum/kubernetes-sig-ui)
* [**Issue tracker**](https://github.com/kubernetes/dashboard/issues)
* [**SIG info**](https://github.com/kubernetes/community/tree/master/sig-ui)
* [**Roles**](ROLES.md)

### Contribution

Learn how to start contribution on the [Contributing Guideline](CONTRIBUTING.md).

### Code of conduct

Participation in the Kubernetes community is governed by the [Kubernetes Code of Conduct](code-of-conduct.md).

## License

[Apache License 2.0](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
