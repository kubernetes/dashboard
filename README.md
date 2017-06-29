# Kubernetes Dashboard

[![Build Status](https://travis-ci.org/kubernetes/dashboard.svg?branch=master)](https://travis-ci.org/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![GitHub release](https://img.shields.io/github/release/kubernetes/dashboard.svg)](https://github.com/kubernetes/dashboard/releases/latest)
[![Greenkeeper badge](https://badges.greenkeeper.io/kubernetes/dashboard.svg)](https://greenkeeper.io/)

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to
manage applications running in the cluster and troubleshoot them, as well as manage the cluster
itself.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Deployment
Provided instructions are compliant with kubernetes 1.6+. If you plan to deploy dashboard on older kubernetes version please
follow [these instructions](#older-kubernetes-versions).

It is likely that the Dashboard is already installed on your cluster. Check it with the following command:
```shell
$ kubectl get pods --all-namespaces | grep dashboard
```

If it is missing please follow installation instructions provided below. For security reasons installation has been split into two parts.
First part will deploy dashboard on your cluster without any privileges. It will only work if RBACs are disabled on your cluster. Second part
will grant dashboard necessary privileges based on chosen cluster configuration.

Deploy dashboard by running:
```shell
$ kubectl create -f https://git.io/kube-dashboard
```

### Multi-tenant configuration
This configuration should be used if cluster will be used by multiple users with different privileges. It grants
dashboard minimal access to apiserver required to start it. Read more about this configuration in [multi tenant setup](docs/user-guide/multi-tenant.md).
```shell
TODO multi-tenant SA, Role deployment
```

### Single-tenant configuration
This configuration should be used only if cluster will be used by trusted users and all of them are allowed to access all of its' resources.
```shell
TODO single-tenant SA, Role deployment
```

### Older kubernetes versions
If you are using Kubernetes 1.5 or earlier, you can install the latest stable release by running the following command:
```shell
$ kubectl create -f https://git.io/kube-dashboard-no-rbac
```
**IMPORATNT:** Please keep in mind that this will only work if RBACs are disabled in your cluster.

### Head releases
You can also install unstable HEAD builds with the newest features that the team works on by
following the [development guide](docs/devel/head-releases.md).

### Graphs
For the metrics and graphs to be available you need to
have [Heapster](https://github.com/kubernetes/heapster/) running on your cluster. We require heapster to be deployed in `kube-system` namespace
together with service named `heapster`. 

## Usage
The easiest way to access Dashboard is to use kubectl. Run the following command in your desktop environment:
```shell
$ kubectl proxy
```
kubectl will handle authentication with apiserver and make Dashboard available at [http://localhost:8001/ui](http://localhost:8001/ui)

The UI can _only_ be accessed from the machine where the command is executed. See `kubectl proxy --help` for more options.

## Alternative Usage
You may access the UI directly via the apiserver proxy. Open a browser and navigate to `https://<kubernetes-master>/ui`.

Please note that this works only if the apiserver is set up to allow authentication with username and password or certificates, however certificates require some manual steps to be installed in the browser. This is not currently the case with the setup tool `kubeadm`. See [documentation](http://kubernetes.io/docs/admin/authentication/) if you want to configure it manually.

If the username and password is configured but unknown to you, then use `kubectl config view` to find it.

## Documentation

* [User Guide](http://kubernetes.io/docs/user-guide/ui/): Entry-level overview

* [Developer Guide](docs/devel/README.md): For anyone interested in contributing

* [Design Guide](docs/design/README.md): For anyone interested in contributing _design_ (less technical)

* [Troubleshooting Guide](docs/user-guide/troubleshooting.md): Common issues encountered while setting up Dashboard

## License

The work done has been licensed under Apache License 2.0. The license file can be found
[here](LICENSE). You can find out more about the license at:

http://www.apache.org/licenses/LICENSE-2.0
