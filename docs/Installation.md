## Official release

**IMPORTANT:** When upgrading from older version of Dashboard to 1.7+ make sure to delete Cluster Role Binding for `kubernetes-dashboard` Service Account, otherwise Dashboard will have full admin access to the cluster.

### Quick setup

The fastest way of deploying Dashboard has been described in our [README](https://github.com/kubernetes/dashboard/blob/master/README.md). It is destined for people that are new to Kubernetes and want to quickly start using Dashboard. Other possible setups for more experienced users, that want to know more about our deployment procedure can be found below.

### Recommended setup

To access Dashboard directly (without `kubectl proxy`) valid certificates should be used to establish a secure HTTPS connection. They can be generated using public trusted Certificate Authorities like [Let's Encrypt](https://letsencrypt.org/). Use them to replace the auto-generated certificates from Dashboard.

This setup requires, that certificates are stored in a secret named `kubernetes-dashboard-certs` in `kube-system`
namespace. Assuming that you have `dashboard.crt` and `dashboard.key` files stored under `$HOME/certs` directory,
you should create secret with contents of these files:

```bash
kubectl create secret generic kubernetes-dashboard-certs --from-file=$HOME/certs -n kube-system
```

Afterwards, you are ready to deploy Dashboard using the following command:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
```

### Alternative setup

This setup is not fully secure. Certificates are not used and Dashboard is exposed only over HTTP. In this setup access
control can be ensured only by using [Authorization Header](
https://github.com/kubernetes/dashboard/wiki/Access-control#authorization-header) feature. 

To deploy Dashboard execute
following command:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/alternative/kubernetes-dashboard.yaml
```

## Development release

Besides official releases, there are also development releases, that are pushed after every successful master build. It is not advised to use them on production environment as they are less stable than the official ones. Following sections describe installation and discovery of development releases.

### Installation

In most of the use cases you need to execute the following command to deploy latest development release:

```bash
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard-head.yaml
```

You can also deploy dashboard on ARM-based clusters:

```
$ kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard-arm-head.yaml
```

### Update

Once installed, the deployment is not automatically updated. In order to update it you need to delete the deployment's pods and wait for it to be recreated. After recreation, it should use the latest image.

Delete all Dashboard pods (assuming that Dashboard is deployed in `kube-system` namespace):
```sh
$ kubectl -n kube-system delete $(kubectl -n kube-system get pod -o name | grep dashboard)
pod "kubernetes-dashboard-3313488171-7706x" deleted
pod "kubernetes-dashboard-3313488171-ddkqd" deleted
pod "kubernetes-dashboard-3313488171-dpf9t" deleted
pod "kubernetes-dashboard-3313488171-jdz1n" deleted
pod "kubernetes-dashboard-3313488171-sxc9n" deleted
```