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

**IMPORTANT:** As of version 1.7 Dashboard uses minimal privileges setup by default. 
It means, that some manual steps are required to make it fully secured and functional. 

### Recommended setup

Full security can be ensured only by accessing Dashboard over HTTPS. In order to enable HTTPS mode certificates need
to be passed to the application. This can be achieved by providing `--tls-cert-file` and `--tls-cert-key` flags to the
Dashboard. 

You need to download and edit our [YAML file](/src/deploy/kubernetes-dashboard.yaml) to set correct path of
certificates:






<!-- TODO -->

```yaml
args:
  ...
  # Uncomment the following lines to provide certificates and enable HTTPS in Dashboard.
  #- --tls-key-file=/path/to/cert.crt
  #- --tls-cert-file=/path/to/cert.key
```

Read our [Access Control](https://github.com/kubernetes/dashboard/wiki/Access-control) guide to 
After performing these changes...










It is likely that the Dashboard is already installed on your cluster. Check with the following command:
```shell
$ kubectl get pods --all-namespaces | grep dashboard
```

If it is missing, you can install the latest stable release by running the following command:
```shell
$ kubectl create -f https://git.io/kube-dashboard
```

You can also install unstable HEAD builds with the newest features that the team works on by
following the [development guide](docs/devel/head-releases.md).

Note that for the metrics and graphs to be available you need to
have [Heapster](https://github.com/kubernetes/heapster/) running in your cluster.

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

## Compatibility matrix

|                     | Kubernetes 1.4 | Kubernetes 1.5 | Kubernetes 1.6 | Kubernetes 1.7 |
|---------------------|----------------|----------------|----------------|----------------|
| **Dashboard 1.4**   | ✓              | ✕              | ✕              | ✕              |
| **Dashboard 1.5**   | ✕              | ✓              | ✕              | ✕              |
| **Dashboard 1.6**   | ✕              | ✕              | ✓              | ?              |
| **Dashboard 1.7**   | ✕              | ✕              | ?              | ✓              |
| **Dashboard HEAD**  | ✕              | ✕              | ?              | ✓              |

- `✓` Fully supported version range.
- `?` Due to breaking changes between Kubernetes API versions, some features might not work in Dashboard (logs, search etc.).
- `✕` Unsupported version range.

## Documentation

Dashboard documentation can be found on [Wiki pages](https://github.com/kubernetes/dashboard/wiki), it includes:

* Common: Entry-level overview

* User Guide: For anyone interested in using Dashboard

* Development Guide: For anyone interested in contributing

## License

The work done has been licensed under Apache License 2.0. The license file can be found
[here](LICENSE). You can find out more about the license at:

http://www.apache.org/licenses/LICENSE-2.0
