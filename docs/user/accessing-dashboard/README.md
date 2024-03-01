# Accessing Dashboard

Once Dashboard has been installed in your cluster it can be accessed in a few different ways. Note that this document does not describe all possible ways of accessing cluster applications.
In case of any error while trying to access Dashboard, please first read our [FAQ](../../common/faq.md) and check [closed issues](https://github.com/kubernetes/dashboard/issues?q=is%3Aissue+is%3Aclosed).
In most cases errors are caused by cluster configuration issues.

## Introduction
This document only describes the basic ways of accessing Kubernetes Dashboard.
If you have modified the default configuration in any way, it might not work.

## `kubectl port-forward`

Use `kubectl port-forward` and access Dashboard with a simple URL. Depending on the chosen installation method you might need to access different service.

For Helm-based installation when `nginx` is being installed by our Helm chart simply run:
```shell
kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-nginx-controller 8443:443
```

In case you have used any other installation method or have `nginx` already installed in your cluster, follow below steps:
1. Find `nginx` installation namespace.
2. Find main `nginx-ingress` service name.

Once you have all the information simply run (make sure to replace placeholders with correct names):
```shell
kubectl -n <nginx-namespace> port-forward svc/<nginx-service-name> 8443:443
```

Now access Dashboard at: [https://localhost:8443](https://localhost:8443).

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
