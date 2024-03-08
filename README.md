# Kubernetes Dashboard

[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

## Introduction

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to manage applications running in the cluster and troubleshoot them, as well as manage the cluster itself.

As of version 7.0.0, we have dropped support for Manifest-based installation. Only Helm-based installation is supported now. Due to multi-container setup and hard dependency on Kong gateway API proxy
it would not be feasible to easily support Manifest-based installation.

Additionally, we have changed the versioning scheme and dropped `appVersion` from Helm chart. It is because, with a multi-container setup, every module is now versioned separately. Helm chart version
can be considered an app version now.

![Dashboard UI workloads page](docs/images/overview.png)

## Installation

Kubernetes Dashboard supports only Helm-based installation currently as it is faster and gives us better control
over all dependencies required by Dashboard to run. We now use a single-container, DBless [Kong](https://hub.docker.com/r/kong/kong-gateway) installation
as a gateway that connects all our containers and exposes the UI. Users can then use any ingress controller or proxy
in front of kong gateway. To find out more about ways to customize your installation check out [helm chart values](charts/kubernetes-dashboard/values.yaml).

In order to install Kubernetes Dashboard simply run:
```console
# Add kubernetes-dashboard repository
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
# Deploy a Helm Release named "kubernetes-dashboard" using the kubernetes-dashboard chart
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard
```

For more information about our Helm chart visit [ArtifactHub](https://artifacthub.io/packages/helm/k8s-dashboard/kubernetes-dashboard).

## Documentation

Dashboard documentation can be found in the [docs](docs/README.md) directory which contains:

* [Common](docs/common/README.md): Entry-level overview.
* [User Guide](docs/user/README.md): Helpful information for users.
* [How to access Dashboard](docs/user/accessing-dashboard/README.md) - Everything you need to know to get access to you Kubernetes Dashboard instance after installation.
* [Access Control](docs/user/access-control/README.md): Find out how to control access to your Kubernetes Dashboard and [create sample user](docs/user/access-control/creating-sample-user.md) that can be used to log in.
* [Developer Guide](DEVELOPMENT.md): Important information for contributors that would like to test, run and work on Dashboard locally.

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
