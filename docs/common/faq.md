# FAQ

In case you did not find any answer here and in [closed issues](https://github.com/kubernetes/dashboard/issues?q=is%3Aissue+is%3Aclosed), [create new issue](https://github.com/kubernetes/dashboard/issues/new/choose).

### I would like to use development environment on HTTPS, how to do it?

Refer to our [Developer guide](../developer/getting-started.md).

### I cannot see any graphs in Dashboard, how to enable them?

Make sure, that `metrics-server` and `dashboard-metrics-scraper` are up and running and Dashboard was able to connect with `dashboard-metrics-scraper`. You should check Dashboard logs and look for `metric` and `scraper` keywords. You can find more informations about Dashboard's Integrations [here](../user/integrations.md).

### During development I receive a lot of strange errors in the browser's console. What may be wrong?

You probably need to update your npm dependencies. Run following commands from Dashboard's root directory:

```shell
npm ci
```

### Why my `Go is not in the path`?

Running into an error like that probably means, that you need to rerun following command:

```shell
export PATH=$PATH:/usr/local/go/bin
```

### I receive `linux mounts: Path /var/lib/kubelet is mounted on / but it is not a shared mount` error. What to do?

Try to run:

```shell
sudo mount --bind /var/lib/kubelet /var/lib/kubelet && sudo mount --make-shared /var/lib/kubelet
```
You can find more information [here](https://github.com/kubernetes/kubernetes/issues/4869#issuecomment-193640483).

### I am seeing 404 errors when trying to access Dashbord. Dashboard resources can not be loaded.

```
GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/static/vendor.9aa0b786.css
proxy:1 GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/static/app.8ebf2901.css
proxy:5 GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/api/appConfig.json
proxy:5 GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/static/app.68d2caa2.js
proxy:5 GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/static/vendor.840e639c.js
proxy:5 GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/api/appConfig.json
proxy:5 GET https://<IP>/api/v1/namespaces/kube-system/services/kubernetes-dashboard/static/app.68d2caa2.js
```

**IMPORTANT:** There is a [known issue](https://github.com/kubernetes/kubernetes/issues/52729) related to Kubernetes 1.7.6 where `/ui` redirect does not work. Try to add trailing slash at the end of `/ui` redirect url: `http://localhost:8001/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy/`

If this does not help then this means there is a problem with your cluster or you are trying to access Dashboard in a wrong way. Usually this happens when you try to expose Dashboard using `kubectl proxy` in a wrong way (i.e. missing permissions).

You can quickly check if accessing
`http://localhost:8001/api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/` instead of `http://localhost:8001/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy` will work for you.

Other way of checking if your issue is related to Dashboard is to expose and access it using **NodePort** method described in our [Accessing Dashboard](../user/accessing-dashboard/README.md) guide. This will allow you to access Dashboard directly without any proxy involved.

If any of described methods will work then this means it is **not** a Dashboard issue and you should seek for help on [core](https://github.com/kubernetes/kubernetes) repository or better yet read [Kubernetes Documentation](https://kubernetes.io/docs/tasks/) first to understand how it works.

### I am using Kubernetes GCE cluster but getting forbidden access errors.

Dashboard on GCE is installed by default with very little permissions. That is not an issue. You should grant `kubernetes-dashboard` Service Account more privileges in order to have access to cluster resources. Read [Kubernetes Documentation](https://kubernetes.io/docs/tasks/) to find out how to do it. You can also check [#2326](https://github.com/kubernetes/dashboard/issues/2326) and [#2415 (comment)](https://github.com/kubernetes/dashboard/issues/2415#issuecomment-348370032) for more details.

### `/ui` redirect does not work or shows `Error: 'malformed HTTP response`.

Based on a way of deploying and accessing Dashboard (HTTPS or HTTP) there are different issues.

#### I'm accessing Dashboard over HTTP

There is a [known issue](https://github.com/kubernetes/kubernetes/issues/52729) related to Kubernetes 1.7.X where `/ui` redirect does not work. Try to add trailing slash at the end of `/ui` redirect url: `http://localhost:8001/api/v1/namespaces/kube-system/services/kubernetes-dashboard/proxy/`

#### I'm accessing Dashboard over HTTPS

The reason why `/ui` redirect does not work for HTTPS is that it hasn't yet been updated in the core repository. You can track https://github.com/kubernetes/kubernetes/pull/53046#discussion_r145338754 to find out when it will be merged. Probably it won't be available until Kubernetes `1.8.3`+.

Correct links that can be used to access Dashboard are in our documentation. Check [Accessing Dashboard](../user/accessing-dashboard/README.md) to find out more.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
