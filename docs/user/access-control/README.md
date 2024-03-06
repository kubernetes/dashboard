# Access control

Once Dashboard is installed and accessible we can focus on configuring access control to the cluster resources for users.

## Introduction

Kubernetes supports few ways of authenticating and authorizing users.
You can read about them [here](https://kubernetes.io/docs/reference/access-authn-authz/authentication/) and
[here](https://kubernetes.io/docs/reference/access-authn-authz/authorization/). Authorization is handled by Kubernetes API server.
Dashboard only acts as a proxy and passes all auth information to it. In case of forbidden access corresponding warnings will be displayed in Dashboard.

## Default Dashboard privileges

### Web container
* `get` and `update` permissions to the Config Map used as settings storage.
  * Default name: `kubernetes-dashboard-settings`. Can be changed via `--settings-config-map-name` argument.
  * Default namespace: `kubernetes-dashboard`. Can be changed via `--namespace` argument.

### API container
* `get` permission for `services/proxy` in order to allow dashboard metrics scraper to gather metrics.
  * Default service name: `kubernetes-dashboard-metrics-scraper`. Can be changed via `--metrics-scraper-service-name` argument.
  * Default namespace `kubernetes-dashboard`. Can be changed via `--namespace` argument.

### Metrics scraper container
* `get`, `list` and `watch` permissions for `metrics.k8s.io` API in order to allow dashboard metrics scraper to gather metrics from the `metrics-server`.

## Authentication

Kubernetes Dashboard supports two different ways of authenticating users:

* [Authorization header](#authorization-header) passed in every request to Dashboard. Supported from release 1.6. Has the highest priority. If present, login view will be skipped.
* [Bearer Token](#bearer-token) that can be used on Dashboard [login view](#login-view).

### Login view

In case you are using the latest installation then login functionality will be enabled by default and exposed via our
gateway.

![Sing in](../../images/signin.png)

### Authorization header

Using authorization header is the only way to make Dashboard act as an user, when accessing it over HTTP. Note that there are some risks since plain HTTP traffic is vulnerable to [MITM attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).

To make Dashboard use authorization header you simply need to pass `Authorization: Bearer <token>` in every request to Dashboard. This can be achieved i.e. by configuring reverse proxy in front of Dashboard. Proxy will be responsible for authentication with identity provider and will pass generated token in request header to Dashboard. Note that Kubernetes API server needs to be configured properly to accept these tokens.

To quickly test it check out [Requestly](https://chrome.google.com/webstore/detail/requestly-redirect-url-mo/mdnleldcmiljblolnjhpnblkcekpdkpa) Chrome browser plugin that allows to manually modify request headers.

**IMPORTANT:** Authorization header will not work if Dashboard is accessed through API server proxy. `kubectl port-forward` described in [Accessing Dashboard](../accessing-dashboard/README.md) guide will not work. It is due to the fact that once request reaches API server all additional headers are dropped.

### Bearer Token

It is recommended to get familiar with [Kubernetes authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/) documentation first to find out how to get token, that can be used to login. In example every Service Account has a Secret with valid Bearer Token that can be used to login to Dashboard.

Recommended lecture to find out how to create Service Account and grant it privileges:

* [Service Account Tokens](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#service-account-tokens)
* [Role and ClusterRole](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole)
* [Service Account Permissions](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#service-account-permissions)

To create sample user and to get its token, see [Creating sample user](./creating-sample-user.md) guide.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
