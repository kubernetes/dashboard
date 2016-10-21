<!--
-----------------NOTICE------------------------
This file is referenced in code as
https://github.com/kubernetes/dashboard/blob/master/docs/user-guide/troubleshooting.md
Do not move it without providing redirects.
-----------------------------------------------
-->

# Troubleshooting

## Authentication to the Kubernetes API Server
If your Kubernetes cluster is not configured correctly, it may fail to contact
the API server. One way this manifests is when users attempt to connect to the
UI in their web browser and see a message like this:

    Get https://1.2.3.4/api/v1/replicationcontrollers: x509: failed to load system roots and no roots provided

This means that Dashboard failed to authenticate to the API server. Before
explaining the solution, it is useful to review how the dashboard discovers
and authenticates with the API server.

Dashboard can connect with the API server in two different ways:

1. The recommended way is to configure nothing. Dashboard will use a service account (as opposed to a user account)
to communicate with the API server.

2. In some Kubernetes environments service accounts are not available. In this case a manual configuration is required. The Dashboard binary can be started with the `--kubeconfig` flag. The value of the flag is a path to a file specifying how to connect to the API server.
The contents of the file is identical to `~/.kube/config` which is used by kubectl to connect to the API server.

## Service Accounts
If using a service account to connect to the API server, Dashboard expects the file
`/var/run/secrets/kubernetes.io/serviceaccount/token` to be present. It provides a secret
token that is required to authenticate with the API server.

Verify with the following commands:

```shell
# start a container that contains curl
$ kubectl run test --image=tutum/curl -- sleep 10000

# check that container is running
$ kubectl get pods
NAME                   READY     STATUS    RESTARTS   AGE
test-701078429-s5kca   1/1       Running   0          16s

# check if secret exists
$ kubectl exec test-701078429-s5kca ls /var/run/secrets/kubernetes.io/serviceaccount/
ca.crt
namespace
token

# get IP of master
$ kubectl get services
NAME         CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   10.0.0.1     <none>        443/TCP   1d

# check base connectivity
$ kubectl exec test-701078429-s5kca -- curl -k https://10.0.0.1
Unauthorized

# connect using tokens
$ TOKEN_VALUE=$(kubectl exec test-701078429-s5kca -- cat /var/run/secrets/kubernetes.io/serviceaccount/token)
$ echo $TOKEN_VALUE
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi....9A
$ kubectl exec test-701078429-s5kca -- curl --cacert /var/run/secrets/kubernetes.io/serviceaccount/ca.crt -H  "Authorization: Bearer $TOKEN_VALUE" https://10.0.0.1
{
  "paths": [
    "/api",
    "/api/v1",
    "/apis",
    "/apis/apps",
    "/apis/apps/v1alpha1",
    "/apis/authentication.k8s.io",
    "/apis/authentication.k8s.io/v1beta1",
    "/apis/authorization.k8s.io",
    "/apis/authorization.k8s.io/v1beta1",
    "/apis/autoscaling",
    "/apis/autoscaling/v1",
    "/apis/batch",
    "/apis/batch/v1",
    "/apis/batch/v2alpha1",
    "/apis/certificates.k8s.io",
    "/apis/certificates.k8s.io/v1alpha1",
    "/apis/extensions",
    "/apis/extensions/v1beta1",
    "/apis/policy",
    "/apis/policy/v1alpha1",
    "/apis/rbac.authorization.k8s.io",
    "/apis/rbac.authorization.k8s.io/v1alpha1",
    "/apis/storage.k8s.io",
    "/apis/storage.k8s.io/v1beta1",
    "/healthz",
    "/healthz/ping",
    "/logs",
    "/metrics",
    "/swaggerapi/",
    "/ui/",
    "/version"
  ]
}
```

If it is not working, there are two possible reasons:

1. The contents of the tokens is invalid. Find the secret name with `kubectl get secrets | grep service-account` and
delete it with `kubectl delete secret <name>`. It will automatically be recreated.

2. You have a non-standard Kubernetes installation and the file containing the token
may not be present. The API server will mount a volume containing this file, but
only if the API server is configured to use the ServiceAccount admission controller.
If you experience this error, verify that your API server is using the ServiceAccount
admission controller. If you are configuring the API server by hand, you can set
this with the `--admission-control` parameter. Please note that you should use
other admission controllers as well. Before configuring this option, you should
read about admission controllers.

More information:

* [User Guide: Service Accounts](http://kubernetes.io/docs/user-guide/service-accounts/)
* [Cluster Administrator Guide: Managing Service Accounts](http://kubernetes.io/docs/admin/service-accounts-admin/)
