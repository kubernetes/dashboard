# Accessing Dashboard

Once Dashboard has been installed in your cluster it can be accessed in a few different ways. Note that this document does not describe all possible ways of accessing cluster applications.
In case of any error while trying to access Dashboard, please first read our [FAQ](../../common/faq.md) and check [closed issues](https://github.com/kubernetes/dashboard/issues?q=is%3Aissue+is%3Aclosed).
In most cases errors are caused by cluster configuration issues.

## Introduction
This document only describes the basic ways of accessing Kubernetes Dashboard.
If you have modified the default configuration in any way, it might not work.

## `kubectl port-forward`

Use `kubectl port-forward` and access dashboard with a simple URL.

```shell
kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-nginx-controller 8443:443
```

Now access Dashboard at: [https://localhost:8443](https://localhost:8443).

## Ingress

Dashboard can be also exposed using Ingress resource. For more information check: https://kubernetes.io/docs/concepts/services-networking/ingress.

## Login not available
If your login view displays below error, this means that you are trying to log in over HTTP, and it has been disabled for the security reasons.

Logging in is available only if URL used to access Dashboard starts with:
  - `http://localhost/...`
  - `http://127.0.0.1/...`
  - `https://<domain_name>/...`

![Login disabled](../images/dashboard-login-disabled.png "Login disabled")

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
