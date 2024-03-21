# Kubernetes Dashboard

[![Go Report Card](https://goreportcard.com/badge/github.com/kubernetes/dashboard)](https://goreportcard.com/report/github.com/kubernetes/dashboard)
[![Coverage Status](https://codecov.io/github/kubernetes/dashboard/coverage.svg?branch=master)](https://codecov.io/github/kubernetes/dashboard?branch=master)
[![GitHub release](https://img.shields.io/github/release/kubernetes/dashboard.svg)](https://github.com/kubernetes/dashboard/releases/latest)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kubernetes/dashboard/blob/master/LICENSE)

## TL;DR

```console
# Add kubernetes-dashboard repository
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
# Deploy a Helm Release named "kubernetes-dashboard" using the kubernetes-dashboard chart
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard
```

# Introduction

This chart bootstraps a [Kubernetes Dashboard](https://github.com/kubernetes/dashboard) deployment on
a [Kubernetes](https://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Installing the Chart

To install the [Chart](https://helm.sh/docs/intro/using_helm/#three-big-concepts) with
the [Release](https://helm.sh/docs/intro/using_helm/#three-big-concepts) name `kubernetes-dashboard`:

```console
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard
```

The command deploys kubernetes-dashboard on the Kubernetes cluster in the `kubernetes-dashboard` namespace with default
configuration.
The [configuration](#configuration) section lists the parameters that can be configured during installation.

## Uninstalling the Chart

To uninstall/delete the `kubernetes-dashboard` deployment:

```console
helm delete kubernetes-dashboard --namespace kubernetes-dashboard
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Access control

It is critical for the Kubernetes cluster to correctly setup access control of Kubernetes Dashboard.
See this [guide](https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/README.md) for details.

It is highly recommended to use RBAC with minimal privileges needed for Dashboard to run.

### NetworkPolicy

You can enable a networkPolicy for this application via the `networkPolicy.enabled` boolean. By default it permits
ingress only to the HTTP or HTTPS port (see `protocolHttp` from values.yaml).

If you wish to disable all ingress to this application you may set the `networkPolicy.ingressDenyAll` boolean to `true`.
If ingress is disabled you must use direct port-forwarding to access this application.

## Configuration

Please refer
to [values.yaml](https://github.com/kubernetes/dashboard/blob/master/charts/kubernetes-dashboard/values.yaml)
for valid values and their defaults.

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install/upgrade`. For example,

```console
helm install kubernetes-dashboard/kubernetes-dashboard --name kubernetes-dashboard \
  --set=api.containers.resources.limits.cpu=200m
```

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the
chart. For example,

```console
helm install kubernetes-dashboard/kubernetes-dashboard --name kubernetes-dashboard -f values.yaml
```

> **Tip**: You can use the default [values.yaml](values.yaml), which is used by default, as reference

### Pod security policy and admission

The chart supports enabling ``PodSecurityPolicy`` for kubernetes 1.24 and prior via a flag in `values.yaml`.

Please be aware `PodSecurityPolicy` is now deprecated and removed from kubernetes 1.25+ onwards. An alternative is to
enable ``PodSecurityAdmission`` for the namespace that kubernetes dashboard will be deployed in. To do this
add [labels to the namespace](https://kubernetes.io/docs/tasks/configure-pod-container/enforce-standards-namespace-labels).
Example below:

```console
kubectl label --overwrite ns kubernetes-dashboard pod-security.kubernetes.io/enforce=baseline
```

## Upgrading an existing Release to a new major version

A major chart version change (like v1.2.3 -> v2.0.0) indicates that there is an
incompatible breaking change needing manual actions.

### Update from 7.x.x-alphaX to 7.x.x

Due to further architecture changes do a clean installation of Kubernetes Dashboard when upgrading from alpha chart version.
Default dependency on both `ingress-nginx-controller` and `cert-manager` have been removed in favor of using a single-container, DBless
`kong` installation as a gateway that connects all our containers and exposes the UI. Users can then use any ingress controller or proxy
in front of kong gateway.

### Upgrade from 6.x.x to 7.x.x

We recommend doing a clean installation. Kubernetes Dashboard `v3` introduced a big architecture changes and now uses `cert-manager`, 
and [ingress-nginx-controller](https://kubernetes.github.io/ingress-nginx/) by default to work properly. In case those are already installed in your cluster, simply set `--set=nginx.enabled=false` 
and `--set=cert-manager.enabled=false` when upgrading. If you want to use different software in addition to disabling `nginx` and `cert-manager` you also 
need to set `--set=app.ingress.enabled=false` to make sure our default `Ingress` resource will not be installed.

### Upgrade from 5.x.x to 6.x.x

- Switch `PodDisruptionBudget` from `policy/v1beta1` to `policy/v1`. Requires kubernetes >= 1.21.0
  if `podDisruptionBudget.enabled` is set to true (false by default).

### Upgrade from 4.x.x to 5.x.x

- Switch Ingress from networking.k8s.io/v1beta1 to networking.k8s.io/v1. Requires kubernetes >= 1.19.0.

### Upgrade from 2.x.x to 3.x.x

- Switch Ingress from extensions/v1beta1 to networking.k8s.io/v1beta1. Requires kubernetes >= 1.14.0.

### Upgrade from 1.x.x to 2.x.x

Version 2.0.0 of this chart is the first version hosted in the kubernetes/dashboard.git repository. v1.x.x until 1.10.1
is hosted on https://github.com/helm/charts.

- This version upgrades to kubernetes-dashboard v2.0.0 along with changes in RBAC management: all secrets are
  explicitly created and ServiceAccount do not have permission to create any secret. On top of that, it completely
  removes the `clusterAdminRole` parameter, being too dangerous. In order to upgrade, please update your configuration
  to remove `clusterAdminRole` parameter and uninstall/reinstall the chart.
- It enables by default values for `podAnnotations` and `securityContext`, please disable them if you don't supoprt them
- It removes `enableSkipLogin` and `enableInsecureLogin` parameters. Please use `extraArgs` instead.
- It adds a `ProtocolHttp` parameter, allowing you to switch the backend to plain HTTP and replaces the
  old `enableSkipLogin` for the network part.
- If `protocolHttp` is not set, it will automatically add to the `Ingress`, if enabled, annotations to support HTTPS
  backends for nginx-ingress and GKE Ingresses.
- It updates all the labels to the
  new [recommended labels](https://github.com/helm/charts/blob/master/REVIEW_GUIDELINES.md#names-and-labels), most of
  them being immutable.
- dashboardContainerSecurityContext has been renamed to containerSecurityContext.

In order to upgrade, please update your configuration to remove `clusterAdminRole` parameter and
adapt `enableSkipLogin`, `enableInsecureLogin`, `podAnnotations` and `securityContext` parameters, and
uninstall/reinstall the chart.

### Version 4.x.x

Starting from version 4.0.0 of this chart, it will only support Helm 3 and remove the support for Helm 2.
If you still use Helm 2 you will need first to migrate the deployment to Helm 3 and then you can upgrade your chart.

To do that you can follow the [guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/)

## Access

For information about how to access, please read
the [kubernetes-dashboard manual](https://github.com/kubernetes/dashboard)
