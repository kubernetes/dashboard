<!--
-----------------NOTICE------------------------
This file is referenced in code as
https://github.com/kubernetes/dashboard/blob/master/docs/user-guide/troubleshooting.md
Do not move it without providing redirects.
-----------------------------------------------
-->

# Troubleshooting


## Authentication to the Kubernetes API Server


A number of components are involved in the authentication process and the first step is to narrow
down the source of the problem, namely whether it is a problem with user authentication or with service authentication.
Both authentications must work:

```
+-------------+   user             +-------------+   service          +-------------+
|             |   authentication   |             |   authentication   |             |
|  browser    +------------------->+  apiserver  +<-------------------+  dashboard  |
|             |                    |             |                    |             |
+-------------+                    +-------------+                    +-------------+

```

__User authentication__

From your workstation you can connect to Dashboard in three different ways:

1. _Authentication through kubectl:_ This is recommended, because it is secure and easy. In your desktop environment (e.g. laptop)
verify that kubectl is configured properly with `kubectl cluster-info`. If you get a response then you can continue.
Enter the command `kubectl proxy`. kubectl will relay the user's credentials to apiserver for authentication and proxy every API request to a local server. This server is unprotected, but this is not a problem as it is only accessible from within the workstation. Now access Dashboard with `http://localhost:8001/ui`. If it fails then your problem is located with service authentication (see next section).

2. _Direct access to apiserver:_ Open a browser with the URL `https://<master>/`. A login dialog should pop up. If it does not, then username & password authentication is not configured for the apiserver. See [documentation](http://kubernetes.io/docs/admin/authentication/) if you want to configure it manually. Next, access Dashboard with `https://<master>/ui`. If it fails then your problem is located with service authentication (see next section).

3. _Bypass apiserver:_ If you are working in a trusted environment then you may access Dashboard without authentication. Expose Dashboard service via NodePort. See [user guide](http://kubernetes.io/docs/user-guide/services/) for details.



__Service authentication__

Dashboard needs information from apiserver. Therefore, authentication is required, which can be achieved in two different ways:

1. _Service Account:_ This is recommended, because nothing has to be configured. Dashboard will use information provided by the system
to communicate with the API server. See 'Service Account' section for details.

2. _Kubeconfig file:_ In some Kubernetes environments service accounts are not available. In this case a manual configuration is required. The Dashboard binary can be started with the `--kubeconfig` flag. The value of the flag is a path to a file specifying how to connect to the API server.
The contents of the file is identical to `~/.kube/config` which is used by kubectl to connect to the API server. See 'kubeconfig' section for details.

In the diagram below you can see the full authentication flow with all options, starting with the browser
on the lower left hand side.
```

Workstation                                        Kubernetes
+------------------+                               +----------------------------------------------------+
|                  |                               |                                                    |
|                  |                               |                                                    |
|  +------------+  |                               |  +------------+   apiserver        +------------+  |
|  |            |  |  authentication with kubectl  |  |            |   proxy            |            |  |
|  | kubectl    +------------------------------------>+ apiserver  +------------------->+ dashboard  |  |
|  | proxy      |  |                               |  |            |                    |            |  |
|  |            |  |                               |  |            |                    |            |  |
|  +--------+---+  |                               |  |            |                    |            |  |
|           ^      |                          +------>+            |  service account/  |            |  |
|  localhost|      |                          |    |  |            |  kubeconfig        |            |  |
|           |      |                          |    |  |            +<-------------------+            |  |
|  +--------+---+  |                          |    |  |            |                    |            |  |
|  |            |  |      direct access       |    |  +------------+                    +------+-----+  |
|  | browser    +-----------------------------+    |                                           |        |
|  |            |  |                               |                                           |        |
|  |            +----------------------------------------------------------------------------->O        |
|  +------------+  |      bypass apiserver         |                                        NodePort    |
|                  |                               |                                                    |
|                  |                               |                                                    |
+------------------+                               +----------------------------------------------------+

```


## Service Account
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

# get service IP of master
$ kubectl get services
NAME         CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   10.0.0.1     <none>        443/TCP   1d

# check base connectivity from cluster inside
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

## kubeconfig
If you want to use a kubeconfig file for authentication, create a
deployment file similar to the one below:
```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  labels:
    app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kubernetes-dashboard
  template:
    metadata:
      labels:
        app: kubernetes-dashboard
    spec:
      containers:
      - name: kubernetes-dashboard
        image: gcr.io/google_containers/kubernetes-dashboard-amd64:v1.x.x
        imagePullPolicy: Always
        ports:
        - containerPort: 9090
          protocol: TCP
        volumeMounts:
        - name: "kubeconfig"
          mountPath: "/etc/kubernetes/"
          readOnly: true
        args:
          - --kubeconfig=/etc/kubernetes/kubeconfig.yaml
        livenessProbe:
          httpGet:
            path: /
            port: 9090
          initialDelaySeconds: 30
          timeoutSeconds: 30
      volumes:
      - name: "kubeconfig"
        hostPath:
          path: "/etc/kubernetes/"
---
kind: Service
apiVersion: v1
metadata:
  labels:
    app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 9090
  selector:
    app: kubernetes-dashboard

```
