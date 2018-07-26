**IMPORTANT:** HTTPS endpoints are only available if you used [Recommended Setup](https://github.com/kubernetes/dashboard/wiki/Installation#recommended-setup), followed [Getting Started](https://github.com/kubernetes/dashboard/blob/master/README.md#getting-started) guide to deploy Dashboard or manually provided `--tls-key-file` and `--tls-cert-file` flags. In case you did not and you access Dashboard over HTTP, then Dashboard can be accessed the same way as [older versions](https://github.com/kubernetes/dashboard/wiki/Accessing-Dashboard---1.6.X-and-below).

**NOTE**: Dashboard should not be exposed publicly over HTTP. For domains accessed over HTTP it will not be possible to sign in. Nothing will happen after clicking Sign in button on login page.

## `kubectl proxy`

`kubectl proxy` creates proxy server between your machine and Kubernetes API server. By default it is only accessible locally (from the machine that started it).

First let's check if kubectl is properly configured and has access to the cluster. In case of error follow [this guide](https://kubernetes.io/docs/tasks/tools/install-kubectl/) to install and set up `kubectl`.
```sh
$ kubectl cluster-info
# Example output
Kubernetes master is running at https://192.168.30.148:6443
Heapster is running at https://192.168.30.148:6443/api/v1/namespaces/kube-system/services/heapster/proxy
KubeDNS is running at https://192.168.30.148:6443/api/v1/namespaces/kube-system/services/kube-dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

Start local proxy server.
```sh
$ kubectl proxy
Starting to serve on 127.0.0.1:8001
```

Once proxy server is started you should be able to access Dashboard from your browser.

To access HTTPS endpoint of dashboard go to: `http://localhost:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/`

**NOTE:** Dashboard should not be exposed publicly using `kubectl proxy` command as it only allows HTTP connection. For domains other than `localhost` and `127.0.0.1` it will not be possible to sign in. Nothing will happen after clicking `Sign in` button on login page.

## NodePort

This way of accessing Dashboard is only recommended for development environments in a single node setup. 

Edit `kubernetes-dashboard` service.
```sh
$ kubectl -n kube-system edit service kubernetes-dashboard
```

You should see `yaml` representation of the service. Change `type: ClusterIP` to `type: NodePort` and save file. If it's already changed go to next step.
```yaml
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
...
  name: kubernetes-dashboard
  namespace: kube-system
  resourceVersion: "343478"
  selfLink: /api/v1/namespaces/kube-system/services/kubernetes-dashboard-head
  uid: 8e48f478-993d-11e7-87e0-901b0e532516
spec:
  clusterIP: 10.100.124.90
  externalTrafficPolicy: Cluster
  ports:
  - port: 443
    protocol: TCP
    targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  sessionAffinity: None
  type: ClusterIP
status:
  loadBalancer: {}
```

Next we need to check port on which Dashboard was exposed.
```sh
$ kubectl -n kube-system get service kubernetes-dashboard
NAME                   CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
kubernetes-dashboard   10.100.124.90   <nodes>       443:31707/TCP   21h
```

Dashboard has been exposed on port `31707 (HTTPS)`. Now you can access it from your browser at: `https://<master-ip>:31707`. `master-ip` can be found by executing `kubectl cluster-info`. Usually it is either `127.0.0.1` or IP of your machine, assuming that your cluster is running directly on the machine, on which these commands are executed.

In case you are trying to expose Dashboard using NodePort on a multi-node cluster, then you have to find out IP of the node on which Dashboard is running to access it. Instead of accessing `https://<master-ip>:<nodePort>` you should access `https://<node-ip>:<nodePort>`.

## API Server

In case Kubernetes API server is exposed and accessible from outside you can directly access dashboard at:
`https://<master-ip>:<apiserver-port>/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/`

**Note:** This way of accessing Dashboard is only possible if you choose to install your user certificates in the browser. In example certificates used by kubeconfig file to contact API Server can be used.

## Ingress

Dashboard can be also exposed using Ingress resource. For more information check: https://kubernetes.io/docs/concepts/services-networking/ingress.