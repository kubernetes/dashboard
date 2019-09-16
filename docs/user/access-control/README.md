# Access control

Once Dashboard is installed and accessible we can focus on configuring access control to the cluster resources for users. As of release 1.7 Dashboard no longer has full admin privileges granted by default. All the privileges are revoked and only [minimal privileges granted](#default-dashboard-privileges), that are required to make Dashboard work.

**IMPORTANT:** This note is only directed to people using Dashboard 1.7 and above. In case Dashboard is accessible only by trusted set of people, all with full admin privileges you may want to grant it [admin privileges](#admin-privileges). Note that other applications should not access Dashboard directly as it may cause privileges escalation. Make sure that in-cluster traffic is restricted to namespaces or just revoke access to Dashboard for other applications inside the cluster.

## Introduction

Kubernetes supports few ways of authenticating and authorizing users. You can read about them [here](https://kubernetes.io/docs/reference/access-authn-authz/authentication/) and [here](https://kubernetes.io/docs/reference/access-authn-authz/authorization/). Authorization is handled by Kubernetes API server. Dashboard only acts as a proxy and passes all auth information to it. In case of forbidden access corresponding warnings will be displayed in Dashboard.

## Default Dashboard privileges

### v1.7

* `create` and `watch` permissions for secrets in `kube-system` namespace required to create and watch for changes of `kubernetes-dashboard-key-holder` secret.
* `get`, `update` and `delete` permissions for secrets named `kubernetes-dashboard-key-holder` and `kubernetes-dashboard-certs` in `kube-system` namespace.
* `proxy` permission to `heapster` service in `kube-system` namespace required to allow getting metrics from heapster.

### v1.8

* `create` permission for secrets in `kube-system` namespace required to create `kubernetes-dashboard-key-holder` secret.
* `get`, `update` and `delete` permissions for secrets named `kubernetes-dashboard-key-holder` and `kubernetes-dashboard-certs` in `kube-system` namespace.
* `get` and `update` permissions for config map named `kubernetes-dashboard-settings` in `kube-system` namespace.
* `proxy` permission to `heapster` service in `kube-system` namespace required to allow getting metrics from heapster.

### v1.10

_T.B.D._

### v2.0

_T.B.D._

## Authentication

As of release 1.7 Dashboard supports user authentication based on:

* [`Authorization: Bearer <token>`](#authorization-header) header passed in every request to Dashboard. Supported from release 1.6. Has the highest priority. If present, login view will not be shown.
* [Bearer Token](#bearer-token) that can be used on Dashboard [login view](#login-view).
* [Username/password](#basic) that can be used on Dashboard [login view](#login-view).
* [Kubeconfig](#kubeconfig) file that can be used on Dashboard [login view](#login-view).

### Login view

Login view has been introduced in release 1.7. In case you are using the latest recommended installation then login functionality will be enabled by default. In any other case and if you prefer to configure certificates manually you need to pass `--tls-cert-file` and `--tls-cert-key` flags to Dashboard. HTTPS endpoint will be exposed on port `8443` of Dashboard container. You can change it by providing `--port` flag.

Using `Skip` option will make Dashboard use privileges of Service Account used by Dashboard. `Skip` button is disabled by default since 1.10.1. Use `--enable-skip-login` dashboard flag to display it.

![Sing in](../../images/signin.png)

### Authorization header

Using authorization header is the only way to make Dashboard act as an user, when accessing it over HTTP. Note that there are some risks since plain HTTP traffic is vulnerable to [MITM attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).

To make Dashboard use authorization header you simply need to pass `Authorization: Bearer <token>` in every request to Dashboard. This can be achieved i.e. by configuring reverse proxy in front of Dashboard. Proxy will be responsible for authentication with identity provider and will pass generated token in request header to Dashboard. Note that Kubernetes API server needs to be configured properly to accept these tokens.

To quickly test it check out [Requestly](https://chrome.google.com/webstore/detail/requestly-redirect-url-mo/mdnleldcmiljblolnjhpnblkcekpdkpa) Chrome browser plugin that allows to manually modify request headers.

**IMPORTANT:** Authorization header will not work if Dashboard is accessed through API server proxy. Both `kubectl proxy` and `API Server` way of accessing Dashboard described in [Accessing Dashboard](../accessing-dashboard/README.md) guide will not work. It is due to the fact that once request reaches API server all additional headers are dropped.

### Bearer Token

It is recommended to get familiar with [Kubernetes authentication](https://kubernetes.io/docs/reference/access-authn-authz/authentication/) documentation first to find out how to get token, that can be used to login. In example every Service Account has a Secret with valid Bearer Token that can be used to login to Dashboard.

Recommended lecture to find out how to create Service Account and grant it privileges:

* [Service Account Tokens](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#service-account-tokens)
* [Role and ClusterRole](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole)
* [Service Account Permissions](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#service-account-permissions)

#### Sample Bearer Token

To create sample user and to get its token, see [Creating sample user](./creating-sample-user.md) guide.

#### Getting token with `kubectl`

There are many Service Accounts created in Kubernetes by default. All with different access permissions. In order to find any token, that can be used to login we'll use `kubectl`:

```
# Check existing secrets in kubernetes-dashboard namespace
$ kubectl -n kubernetes-dashboard get secret
NAME                               TYPE                                  DATA   AGE
default-token-2pjhm                kubernetes.io/service-account-token   3      81m
kubernetes-dashboard-certs         Opaque                                0      81m
kubernetes-dashboard-csrf          Opaque                                1      81m
kubernetes-dashboard-key-holder    Opaque                                2      81m
kubernetes-dashboard-token-x9nd8   kubernetes.io/service-account-token   3      81m

$ kubectl -n kubernetes-dashboard describe secrets kubernetes-dashboard-token-x9nd8
Name:         kubernetes-dashboard-token-x9nd8
Namespace:    kubernetes-dashboard
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: kubernetes-dashboard
              kubernetes.io/service-account.uid: 2140a425-447f-437f-9966-24ab4e57217a

Type:  kubernetes.io/service-account-token

Data
====
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJrdWJlcm5ldGVzLWRhc2hib2FyZC10b2tlbi14OW5kOCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjIxNDBhNDI1LTQ0N2YtNDM3Zi05OTY2LTI0YWI0ZTU3MjE3YSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDprdWJlcm5ldGVzLWRhc2hib2FyZCJ9.oSOjJZpQq-yiAIQWM12gFpVA6jiJz8-zApC0Wbet9iwzflmCVFlT1lWjEEduKMnJOF-viJ4fwLixA3INfCxDgWIBmxEvoA-R6ExQNkmFi4ljGdBX98fI2B4WFuqWIPoEjqf1l3eXHKmXgqbiMYA-UH_Ih4m2-aKKO3dfkmc5HmPP1ZjotCQKGpcq60c1y-SASqbC_FC3LHvp0l5N9bfhAOraNC_34ZlL3zkQ6cAL6mZG8Ci1MuXMHTH9g04QaVZb14f6BAY-K2X-Z5yDpMr4Zs5h6DOc_18sysf4uOVyo0wMXfI9gLsda-e3zX_5W39piBj-PwfBwBGslC_JztTCSQ
ca.crt:     1066 bytes
namespace:  20 bytes
```

We can now use printed `token` to login to Dashboard. To find out more about how to configure and use Bearer Tokens, please read [Introduction](#introduction) section.

### Basic
Basic authentication is disabled by default. The reason is that Kubernetes API server needs to be configured with authorization mode ABAC and `--basic-auth-file` flag provided. Without that API server automatically falls back to [anonymous user](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#anonymous-requests) and there is no way to check if provided credentials are valid.

In order to enable basic auth in Dashboard `--authentication-mode=basic` flag has to be provided. By default it is set to `--authentication-mode=token`.

### Kubeconfig

This method of logging in is provided for convenience. Only authentication options specified by `--authentication-mode` flag are supported in kubeconfig file. In case it is configured to use any other way, error will be shown in Dashboard. External identity providers or certificate-based authentication are not supported at this time.

![Sign in with kubeconfig](../../images/signin-with-kubeconfig.png)

## Admin privileges

**IMPORTANT:** Make sure that you know what you are doing before proceeding. Granting admin privileges to Dashboard's Service Account might be a security risk.

You can grant full admin privileges to Dashboard's Service Account by creating below `ClusterRoleBinding`. Copy the YAML file based on chosen installation method and save as, i.e. `dashboard-admin.yaml`. Use `kubectl create -f dashboard-admin.yaml` to deploy it. Afterwards you can use `Skip` option on login page to access Dashboard.

### Official release

```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: kubernetes-dashboard
    namespace: kubernetes-dashboard
```

### Development release

```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubernetes-dashboard-head
  namespace: kubernetes-dashboard-head
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: kubernetes-dashboard-head
    namespace: kubernetes-dashboard-head
```

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
