# Kubernetes Dashboard
[![Build Status](https://travis-ci.org/kubernetes/dashboard.svg?branch=master)](https://travis-ci.org/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to
manage applications running in the cluster and troubleshoot them, as well as manage the cluster
itself.

## Users questionnaire
Fill out the form to prioritize our work and help us make the UI better: http://goo.gl/forms/DloIYjsJBr

## Usage

It is likely that Dashboard is already installed on your cluster. To access it navigate in your
browser to one of the following URLs: `https://<kubernetes-master>/ui` which redirects to
`https://<kubernetes-master>/api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard`.

If you find that you’re not able to access the Dashboard you can install and open the latest
stable release by running the following commands:
```bash
kubectl create -f https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard.yaml
kubectl proxy --port=8080
```
And then navigate to `http://localhost:8080/api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard`

## Documentation

* The [user guide](http://kubernetes.io/docs/user-guide/ui/) is an entry point for users of Dashboard

* The [design overview](docs/design/README.md) describes design concepts of Dashboard

* The [developer guide](docs/devel/README.md) is for anyone wanting to contribute to Dashboard


## License

The work done has been licensed under Apache License 2.0. The license file can be found
[here](LICENSE). You can find out more about the license at:

http://www.apache.org/licenses/LICENSE-2.0
