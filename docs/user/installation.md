## Official release

### Quick setup

The fastest way of deploying Dashboard has been described in our [README](../../README.md). It is destined for people that are new to Kubernetes and want to quickly start using Dashboard. Other possible setups for more experienced users, that want to know more about our deployment procedure can be found below.

### Recommended setup

To access Dashboard directly (without `kubectl proxy`) valid certificates should be used to establish a secure HTTPS connection. They can be generated using public trusted Certificate Authorities like [Let's Encrypt](https://letsencrypt.org/), optionally [Cert-Manager](https://docs.cert-manager.io) can auto-issue and auto-renew them. Use them to replace the auto-generated certificates from Dashboard.

By default self-signed certificates are generated and stored in-memory. In case you would like to use your custom certificates follow the below steps, otherwise skip directly to the Dashboard deploy part.

Custom certificates have to be stored in a secret named `kubernetes-dashboard-certs` in the same namespace as Kubernetes Dashboard. Assuming that you have `tls.crt` and `tls.key` files stored under `$HOME/certs` directory, you should create secret with contents of these files:

```shell
kubectl create secret generic kubernetes-dashboard-certs --from-file=$HOME/certs -n kubernetes-dashboard
```

For Dashboard to pickup the certificates, you must pass arguments `--tls-cert-file=/tls.crt` and `--tls-key-file=/tls.key` to the container. You can edit YAML definition and deploy Dashboard in one go:

```shell
kubectl create --edit -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/recommended.yaml
```

Under Deployment section, add arguments to pod definition, it should look as follows:
```yaml
      containers:
      - args:
        - --tls-cert-file=/tls.crt
        - --tls-key-file=/tls.key
```
`--auto-generate-certificates` can be left in place, and will be used as a fallback.

### Alternative setup

This setup is not fully secure. Certificates are not used and Dashboard is exposed only over HTTP. In this setup access control can be ensured only by using [Authorization Header](./access-control/README.md#authorization-header) feature.

To deploy Dashboard execute following command:

```shell
kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/alternative.yaml
```


## Development release

Besides official releases, there are also development releases, that are pushed after every successful master build. It is not advised to use them on production environment as they are less stable than the official ones. Following sections describe installation and discovery of development releases.

### Installation

In most of the use cases you need to execute the following command to deploy latest development release:

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.1/aio/deploy/head.yaml
```

### Update

Once installed, the deployment is not automatically updated. In order to update it you need to delete the deployment's pods and wait for it to be recreated. After recreation, it should use the latest image.

Delete all Dashboard pods (assuming that Dashboard is deployed in kubernetes-dashboard namespace):

```shell
kubectl -n kubernetes-dashboard delete $(kubectl -n kubernetes-dashboard get pod -o name | grep dashboard)
```

The output is similar to this:

```
pod "dashboard-metrics-scraper-fb986f88d-gnfnk" deleted
pod "kubernetes-dashboard-7d8b9cc8d-npljm" deleted
```

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
