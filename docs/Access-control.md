Once Dashboard is installed and accessible we can focus on configuring access control to the cluster resources for users. As of release 1.7 Dashboard no longer has full admin privileges granted by default. All the privileges are revoked and only [minimal privileges granted](#default-dashboard-privileges), that are required to make Dashboard work.

**IMPORTANT:** This note is only directed to people using Dashboard 1.7 and above. In case Dashboard is accessible only by trusted set of people, all with full admin privileges you may want to grant it [admin privileges](#admin-privileges). Note that other applications should not access Dashboard directly as it may cause privileges escalation. Make sure that in-cluster traffic is restricted to namespaces or just revoke access to Dashboard for other applications inside the cluster.

## Introduction

Kubernetes supports few ways of authenticating and authorizing users. You can read about them [here](https://kubernetes.io/docs/admin/authentication) and [here](https://kubernetes.io/docs/admin/authorization). Authorization is handled by Kubernetes API server. Dashboard only acts as a proxy and passes all auth information to it. In case of forbidden access corresponding warnings will be displayed in Dashboard.

## Default Dashboard privileges

### v1.7
- `create` and `watch` permissions for secrets in `kube-system` namespace required to create and watch for changes of `kubernetes-dashboard-key-holder` secret.
- `get`, `update` and `delete` permissions for secrets named `kubernetes-dashboard-key-holder` and `kubernetes-dashboard-certs` in `kube-system` namespace.
- `proxy` permission to `heapster` service in `kube-system` namespace required to allow getting metrics from heapster.

### v1.8
- `create` permission for secrets in `kube-system` namespace required to create `kubernetes-dashboard-key-holder` secret.
- `get`, `update` and `delete` permissions for secrets named `kubernetes-dashboard-key-holder` and `kubernetes-dashboard-certs` in `kube-system` namespace.
- `get` and `update` permissions for config map named `kubernetes-dashboard-settings` in `kube-system` namespace.
- `proxy` permission to `heapster` service in `kube-system` namespace required to allow getting metrics from heapster.

## Authentication

As of release 1.7 Dashboard supports user authentication based on:
- [`Authorization: Bearer <token>`](#authorization-header) header passed in every request to Dashboard. Supported from release 1.6. Has the highest priority. If present, login view will not be shown.
- [Bearer Token](#bearer-token) that can be used on Dashboard [login view](#login-view).
- [Username/password](#basic) that can be used on Dashboard [login view](#login-view).
- [Kubeconfig](#kubeconfig) file that can be used on Dashboard [login view](#login-view).

### Login view
Login view has been introduced in release 1.7. In order to make it appear in Dashboard you need to enable and access Dashboard over HTTPS. To do so you need to pass `--tls-cert-file` and `--tls-cert-key` flags to Dashboard. HTTPS endpoint will be exposed on port `8443` of Dashboard container. You can change it by providing `--port` flag.

Using `Skip` option will make Dashboard use privileges of Service Account used by Dashboard.

![zrzut ekranu z 2017-09-14 09-17-02](https://user-images.githubusercontent.com/2285385/30416718-8ee657d8-992d-11e7-84c8-9ba5f4c78bb2.png)

### Authorization header

Using authorization header is the only way to make Dashboard act as an user, when accessing it over HTTP. Note that there are some risks since plain HTTP traffic is vulnerable to [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) attacks.

To make Dashboard use authorization header you simply need to pass `Authorization: Bearer <token>` in every request to Dashboard. This can be achieved i.e. by configuring reverse proxy in front of Dashboard. Proxy will be responsible for authentication with identity provider and will pass generated token in request header to Dashboard. Note that Kubernetes API server needs to be configured properly to accept these tokens.

To quickly test it check out [Requestly](https://chrome.google.com/webstore/detail/requestly-redirect-url-mo/mdnleldcmiljblolnjhpnblkcekpdkpa) browser plugin that allows to manually modify request headers.

**IMPORTANT**: Authorization header will not work if Dashboard is accessed through API server proxy. Both `kubectl proxy` and `API Server` way of accessing Dashboard described in [Accessing Dashboard](https://github.com/kubernetes/dashboard/wiki/Accessing-dashboard) guide will not work. It is due to the fact that once request reaches API server all additional headers are dropped. You can track proposal that was supposed to make it work [here](https://github.com/kubernetes/kubernetes/pull/29714).

### Bearer Token

It is recommended to get familiar with [Kubernetes authentication](https://kubernetes.io/docs/admin/authentication) documentation first to find out how to get token, that can be used to log in. In example every Service Account has a Secret with valid Bearer Token that can be used to log in to Dashboard.

Recommended lecture to find out how to create Service Account and grant it privileges:
- [Service Account Tokens](https://kubernetes.io/docs/admin/authentication/#service-account-tokens)
- [Role and ClusterRole](https://kubernetes.io/docs/admin/authorization/rbac/#role-and-clusterrole)
- [Service Account Permissions](https://kubernetes.io/docs/admin/authorization/rbac/#service-account-permissions)

#### Sample Bearer Token

![zrzut ekranu z 2017-09-13 11-29-36](https://user-images.githubusercontent.com/2285385/30370159-09af99aa-9877-11e7-8cb6-28fb9af88c83.png)

#### Getting token with `kubectl`

There are many Service Accounts created in Kubernetes by default. All with different access permissions. In order to find any token, that can be used to log in we'll use `kubectl`:

```bash
# Check existing secrets in kube-system namespace
$ kubectl -n kube-system get secret
# All secrets with type 'kubernetes.io/service-account-token' will allow to log in.
# Note that they have different privileges.
NAME                                     TYPE                                  DATA      AGE
attachdetach-controller-token-xw1tw      kubernetes.io/service-account-token   3         10d
bootstrap-signer-token-gz8qp             kubernetes.io/service-account-token   3         10d
bootstrap-token-f46476                   bootstrap.kubernetes.io/token         5         10d
certificate-controller-token-tp34m       kubernetes.io/service-account-token   3         10d
daemon-set-controller-token-fqvwx        kubernetes.io/service-account-token   3         10d
default-token-3d5t4                      kubernetes.io/service-account-token   3         10d
deployment-controller-token-3gd7d        kubernetes.io/service-account-token   3         10d
disruption-controller-token-gdsxq        kubernetes.io/service-account-token   3         10d
endpoint-controller-token-vrxpg          kubernetes.io/service-account-token   3         10d
flannel-token-xrldr                      kubernetes.io/service-account-token   3         10d
foo-secret                               kubernetes.io/tls                     2         6d
generic-garbage-collector-token-hk04n    kubernetes.io/service-account-token   3         10d
heapster-token-wgwgx                     kubernetes.io/service-account-token   3         10d
horizontal-pod-autoscaler-token-4865f    kubernetes.io/service-account-token   3         10d
job-controller-token-q0wdp               kubernetes.io/service-account-token   3         10d
kd-dashboard-token-token-bw08g           kubernetes.io/service-account-token   3         7d
kube-dns-token-qc79f                     kubernetes.io/service-account-token   3         10d
kube-proxy-token-22kd5                   kubernetes.io/service-account-token   3         10d
kubernetes-dashboard-head-token-pq4hk    kubernetes.io/service-account-token   3         6d
kubernetes-dashboard-key-holder          Opaque                                2         5d
kubernetes-dashboard-token-7qmbc         kubernetes.io/service-account-token   3         6d
namespace-controller-token-k6zfw         kubernetes.io/service-account-token   3         10d
node-controller-token-0821f              kubernetes.io/service-account-token   3         10d
persistent-volume-binder-token-vgt06     kubernetes.io/service-account-token   3         10d
pod-garbage-collector-token-6pz9t        kubernetes.io/service-account-token   3         10d
replicaset-controller-token-kzpmc        kubernetes.io/service-account-token   3         10d
replication-controller-token-4x5wh       kubernetes.io/service-account-token   3         10d
resourcequota-controller-token-srbqv     kubernetes.io/service-account-token   3         10d
service-account-controller-token-7qp8r   kubernetes.io/service-account-token   3         10d
service-controller-token-p46zd           kubernetes.io/service-account-token   3         10d
statefulset-controller-token-npt26       kubernetes.io/service-account-token   3         10d
token-cleaner-token-gdfq3                kubernetes.io/service-account-token   3         10d
ttl-controller-token-pt064               kubernetes.io/service-account-token   3         10d
# Let's get token from 'replicaset-controller-token-kzpmc'. 
# It should have permissions to see Replica Sets in the cluster.
$ kubectl -n kube-system describe secret replicaset-controller-token-kzpmc
Name:		replicaset-controller-token-kzpmc
Namespace:	kube-system
Labels:		<none>
Annotations:	kubernetes.io/service-account.name=replicaset-controller
		kubernetes.io/service-account.uid=d0d93741-96c5-11e7-8245-901b0e532516

Type:	kubernetes.io/service-account-token

Data
====
ca.crt:		1025 bytes
namespace:	11 bytes
token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJyZXBsaWNhc2V0LWNvbnRyb2xsZXItdG9rZW4ta3pwbWMiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoicmVwbGljYXNldC1jb250cm9sbGVyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiZDBkOTM3NDEtOTZjNS0xMWU3LTgyNDUtOTAxYjBlNTMyNTE2Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Omt1YmUtc3lzdGVtOnJlcGxpY2FzZXQtY29udHJvbGxlciJ9.wAzSLnDudLbAeeU9eRsPlVELLJ6EokDT8mLpEm868hh_Ot_7Pp68321a9ssddIczPqJeifG_nFaKovkdmjozysLvwYCfpKZEkQjl_VKrr9oBzrlGUk-1oaztoLMxxtlm1FuVd_2moWbrQYRv0sGdtmZLZl9vAfW2s3vpwSn_t8XRB-bcombjBakbjm3os4RsiutAS7vevdyJMkAIjKalwZnNJ0nMaY8qEpA85WjEF86zjj_QBpZFt8tJZ7IO3uUuTLgBdDJr8dPwJhkMZp_eE_zGkpsBlp34fdg-1_TQGDm0fokvBkRt8luSR9HnyYxk6UEk5MT60WeaEzvCe3J4SA
```

We can now use printed `token` to log in to Dashboard. To find out more about how to configure and use Bearer Tokens, please read [Introduction](https://github.com/kubernetes/dashboard/wiki/Access-control#introduction) section.

### Basic

Basic authentication is disabled by default. The reason is that Kubernetes API server needs to be configured with authorization mode ABAC and `--basic-auth-file` flag provided. Without that API server automatically falls back to [anonymous user](https://kubernetes.io/docs/admin/authentication/#anonymous-requests) and there is no way to check if provided credentials are valid.

In order to enable basic auth in Dashboard `--authentication-mode=basic` flag has to be provided. By default it is set to `--authentication-mode=token`.

### Kubeconfig

This method of logging in is provided for convenience. Only authentication options specified by `--authentication-mode` flag are supported in kubeconfig file. In case it is configured to use any other way, error will be shown in Dashboard. External identity providers or certificate-based authentication are not supported at this time.

![zrzut ekranu z 2017-08-31 13-28-38](https://user-images.githubusercontent.com/2285385/29920994-5214087e-8e50-11e7-8ab9-c75755b62a47.png)

## Admin privileges

**IMPORTANT:** Make sure that you know what you are doing before proceeding. Granting admin privileges to Dashboard's Service Account might be a security risk.

You can grant full admin privileges to Dashboard's Service Account by creating below `ClusterRoleBinding`. Copy the YAML file based on chosen installation method and save as, i.e. `dashboard-admin.yaml`. Use `kubectl create -f dashboard-admin.yaml` to deploy it. Afterwards you can use `Skip` option on login page to access Dashboard.

### Official release
```yaml
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: kubernetes-dashboard
  labels:
    k8s-app: kubernetes-dashboard
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: kubernetes-dashboard
  namespace: kube-system
```

### Development release
```yaml
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: kubernetes-dashboard-head
  labels:
    k8s-app: kubernetes-dashboard-head
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: kubernetes-dashboard-head
  namespace: kube-system
```