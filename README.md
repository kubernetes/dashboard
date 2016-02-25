# Kubernetes Dashboard
[![Build Status](https://travis-ci.org/kubernetes/dashboard.svg?branch=master)](https://travis-ci.org/kubernetes/dashboard)

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to
manage applications running in the cluster and troubleshoot them, as well as manage the cluster
itself.

## Usage

The Dashboard is currently under active development and is not ready for production use (yet!). To run the latest _unstable_ version execute the following command:

``
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard-canary.yaml
``

## Documentation

* The [Design overview](docs/design/README.md) describes design concepts of Dashboard

* The [Developer guide](docs/devel/README.md) is for anyone wanting to contribute to Dashboard


## License

The work done has been licensed under Apache License 2.0. The license file can be found
[here](LICENSE). You can find out more about the license at:

http://www.apache.org/licenses/LICENSE-2.0
