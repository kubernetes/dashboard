# kubernetes-dashboard

[Kubernetes Dashboard](https://github.com/kubernetes/dashboard) is a general purpose, web-based UI for Kubernetes clusters.
It allows users to manage applications running in the cluster and troubleshoot them, as well as manage the cluster itself.

## TL;DR

```console
# Add kubernetes-dashboard repository
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
# Deploy a Helm Release named "kubernetes-dashboard" using the kubernetes-dashboard chart
helm install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard
```

## Introduction

This chart bootstraps a [Kubernetes Dashboard](https://github.com/kubernetes/dashboard) deployment on a [Kubernetes](https://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Installing the Chart

To install the [Chart](https://helm.sh/docs/intro/using_helm/#three-big-concepts) with the [Release](https://helm.sh/docs/intro/using_helm/#three-big-concepts) name `kubernetes-dashboard`:

```console
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
helm install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard
```

The command deploys kubernetes-dashboard on the Kubernetes cluster in the default configuration.
The [configuration](#configuration) section lists the parameters that can be configured during installation.

## Uninstalling the Chart

To uninstall/delete the `kubernetes-dashboard` deployment:

```console
helm delete kubernetes-dashboard
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Access control

It is critical for the Kubernetes cluster to correctly setup access control of Kubernetes Dashboard.
See this [guide](https://github.com/kubernetes/dashboard/blob/master/docs/user/access-control/README.md) for details.

It is highly recommended to use RBAC with minimal privileges needed for Dashboard to run.

## Configuration

Please refer to [values.yaml](https://github.com/kubernetes/dashboard/blob/master/aio/deploy/helm-chart/kubernetes-dashboard/values.yaml)
for valid values and their defaults.

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example,

```console
helm install kubernetes-dashboard/kubernetes-dashboard --name kubernetes-dashboard \
  --set=service.externalPort=8080,resources.limits.cpu=200m
```

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example,

```console
helm install kubernetes-dashboard/kubernetes-dashboard --name kubernetes-dashboard -f values.yaml
```

> **Tip**: You can use the default [values.yaml](values.yaml), which is used by default, as reference

## Upgrading an existing Release to a new major version

A major chart version change (like v1.2.3 -> v2.0.0) indicates that there is an
incompatible breaking change needing manual actions.

### Upgrade from 4.x.x to 5.x.x

- Switch Ingress from networking.k8s.io/v1beta1 to networking.k8s.io/v1. Requires kubernetes >= 1.19.0.

### Upgrade from 2.x.x to 3.x.x

- Switch Ingress from extensions/v1beta1 to networking.k8s.io/v1beta1. Requires kubernetes >= 1.14.0.

### Upgrade from 1.x.x to 2.x.x

Version 2.0.0 of this chart is the first version hosted in the kubernetes/dashboard.git repository. v1.x.x until 1.10.1 is hosted on https://github.com/helm/charts.

- This version upgrades to kubernetes-dashboard v2.0.0 along with changes in RBAC management: all secrets are explicitely created and ServiceAccount do not have permission to create any secret. On top of that, it completely removes the `clusterAdminRole` parameter, being too dangerous. In order to upgrade, please update your configuration to remove `clusterAdminRole` parameter and uninstall/reinstall the chart.
- It enables by default values for `podAnnotations` and `securityContext`, please disable them if you don't supoprt them
- It removes `enableSkipLogin` and `enableInsecureLogin` parameters. Please use `extraArgs` instead.
- It adds a `ProtocolHttp` parameter, allowing you to switch the backend to plain HTTP and replaces the old `enableSkipLogin` for the network part.
- If `protocolHttp` is not set, it will automatically add to the `Ingress`, if enabled, annotations to support HTTPS backends for nginx-ingress and GKE Ingresses.
- It updates all the labels to the new [recommended labels](https://github.com/helm/charts/blob/master/REVIEW_GUIDELINES.md#names-and-labels), most of them being immutable.
- dashboardContainerSecurityContext has been renamed to containerSecurityContext.

In order to upgrade, please update your configuration to remove `clusterAdminRole` parameter and adapt `enableSkipLogin`, `enableInsecureLogin`, `podAnnotations` and `securityContext` parameters, and uninstall/reinstall the chart.

### Version 4.x.x

Starting from version 4.0.0 of this chart, it will only support Helm 3 and remove the support for Helm 2.
If you still use Helm 2 you will need first to migrate the deployment to Helm 3 and then you can upgrade your chart.

To do that you can follow the [guide](https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/)

## Access

For information about how to access, please read the [kubernetes-dashboard manual](https://github.com/kubernetes/dashboard)

### Using the dashboard with 'kubectl proxy'

When running 'kubectl proxy', the address `localhost:8001/ui` automatically expands to:

- `http://localhost:8001/api/v1/namespaces/my-namespace/services/https:kubernetes-dashboard:https/proxy/`

For this to reach the dashboard, the name of the service must be 'kubernetes-dashboard', not any other value as set by Helm.
You can manually specify this using the value 'fullnameOverride':

```yaml
fullnameOverride: 'kubernetes-dashboard'
```
