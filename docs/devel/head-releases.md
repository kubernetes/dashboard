# Introduction

This document describes how to install and discover development releases of the UI.

## Installation

To install latest HEAD release, execute the following command.
```bash
kubectl create -f https://rawgit.com/kubernetes/dashboard/master/src/deploy/kubernetes-dashboard-head.yaml
```

Once installed, the release of the UI is not automatically updated. In order to update it, delete
the pod of the UI and wait for it to be recreated. After recreation it should use latest HEAD image.

## Development images

Kubernetes Dashboard UI development images are published on every commit to master branch. They
are pushed to
[kubernetesdashboarddev/kubernetes-dashboard-$ARCH](https://hub.docker.com/r/kubernetesdashboarddev)
repositories. Each HEAD build produces one image for each architecture. The images are then tagged
with SHA of the commit they were built at and `head` tag is updated to reference the newest one.
