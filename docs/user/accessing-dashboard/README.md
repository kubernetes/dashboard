# Accessing Dashboard

Once Dashboard has been installed in your cluster it can be accessed in a few different ways. Note that this document does not describe all possible ways of accessing cluster applications.
In case of any error while trying to access Dashboard, please first read our [FAQ](../../common/faq.md) and check [closed issues](https://github.com/kubernetes/dashboard/issues?q=is%3Aissue+is%3Aclosed).
In most cases errors are caused by cluster configuration issues.

## Introduction
This document only describes the basic way of accessing Kubernetes Dashboard.
If you have modified the default configuration in any way, it might not work.

## `kubectl port-forward`

Use `kubectl port-forward` and access Dashboard with a simple URL. Depending on the chosen installation method you might need to access different service.

For Helm-based installation when `kong` is being installed by our Helm chart simply run:
```shell
kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-kong-proxy 8443:443
```

Now access Dashboard at: [https://localhost:8443](https://localhost:8443).

## `kubectl proxy`

Use `kubectl proxy` and access Dashboard with a simple URL.

```shell
kubectl proxy --port=8001
```

Now access Dashboard at: [http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard-kong-proxy:443/proxy/](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard-kong-proxy:443/proxy/)

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
