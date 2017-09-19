# Kubernetes Dashboard

[![Build Status](https://travis-ci.org/kubernetes/dashboard.svg?branch=master)](https://travis-ci.org/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![GitHub release](https://img.shields.io/github/release/kubernetes/dashboard.svg)](https://github.com/kubernetes/dashboard/releases/latest)
[![Greenkeeper badge](https://badges.greenkeeper.io/kubernetes/dashboard.svg)](https://greenkeeper.io/)

Kubernetes Dashboard is a general purpose, web-based UI for Kubernetes clusters. It allows users to manage applications
running in the cluster and troubleshoot them, as well as manage the cluster itself.

![Dashboard UI workloads page](docs/dashboard-ui.png)

## Getting Started

**IMPORTANT:** Since version 1.7 Dashboard uses more secure setup. It means, that by default it has minimal set of
privileges and is accessed over HTTPS. Follow instructions below to quickly start using Dashboard or read
[Installation](https://github.com/kubernetes/dashboard/wiki/Installation) and [Access Control](
https://github.com/kubernetes/dashboard/wiki/Access-control) guides to learn about other possible setups.

You can start using Dashboard executing following command:

```sh

```

After installing Dashboard check [Accessing Dashboard](
https://github.com/kubernetes/dashboard/wiki/Accessing-dashboard) guide.

**NOTE:** You need to have [Heapster](https://github.com/kubernetes/heapster/) running in your cluster for the metrics
and graphs to be available. You can read more about it in [Integrations](
https://github.com/kubernetes/dashboard/wiki/Integrations) guide.


## Documentation

Dashboard documentation can be found on [Wiki](https://github.com/kubernetes/dashboard/wiki) pages, it includes:

* Common: Entry-level overview

* User Guide: For anyone interested in using Dashboard

* Development Guide: For anyone interested in contributing

## License

The work done has been licensed under Apache License 2.0. The license file can be found [here](LICENSE). You can find
out more about the license at [www.apache.org/licenses/LICENSE-2.0](www.apache.org/licenses/LICENSE-2.0).
