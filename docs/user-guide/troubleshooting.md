# Troubleshooting

## Authentication to the Kubernetes API Server
If your Kubernetes cluster is not configured correctly, it may fail to contact
the API server. One way this manifests is when users attempt to connect to the
UI in their web browser and see a message like this:

    Get https://1.2.3.4/api/v1/replicationcontrollers: x509: failed to load system roots and no roots provided

This means that the dashboard failed to authenticate to the API server. Before
explaining the solution, it is useful to review how the dashboard discovers
and authenticates with the API server.

The dashboard uses a service account (as opposed to a user account) to communicate
with the API server. In order to contact the API server, the dashboard expects
the following:

1. Two environment variables, `KUBERNETES_SERVICE_HOST` and `KUBERNETES_SERVICE_PORT`
provide the host and port of the API server. You can override these environment
variables by providing the --apiserver-host argument when starting the dashboard
pod, but you normally do not need to do this.

2. A file, `/var/run/secrets/kubernetes.io/serviceaccount/token` provides a secret
token that is required to authenticate with the API server.

If you have a non-standard Kubernetes installation, the file containing the token
may not be present. The API server will mount a volume containing this file, but
only if the API server is configured to use the ServiceAccount admission controller.

If you experience this error, verify that your API server is using the ServiceAccount
admission controller. If you are configuring the API server by hand, you can set
this with the `--admission-control` parameter. Please note that you should use
other admission controllers as well. Before configuring this option, you should
read about admission controllers. Two good references are:

* [User Guide: Service Accounts](http://kubernetes.io/docs/user-guide/service-accounts/)
* [Cluster Administrator Guide: Managing Service Accounts](http://kubernetes.io/docs/admin/service-accounts-admin/)
