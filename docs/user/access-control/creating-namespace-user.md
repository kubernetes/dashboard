## Creating namespace user

In this guide, we will find out how to create a new user using the Service Account mechanism of Kubernetes, grant this user `the namespace level`permissions and login to Dashboard using a  token tied to this user. If you want to grant the cluster admin permissions, you can refer to [creating-sample-user.md](./creating-sample-user.md).


## Creating a Service Account

We are creating Service Account with the name `edit-user` in namespace `kubernetes-dashboard` first.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: edit-user
  namespace: kubernetes-dashboard
```

## Creating a RoleBinding

In most cases after provisioning the cluster using `kops`, `kubeadm` or any other popular tool, the namespace level permissions `admin` `edit` `view`already exists in the cluster. We can use it and create only a `RoleBinding` for our `ServiceAccount`. You can refer to [this document](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#user-facing-roles) for introduction on namespace level permissions.
you can also create the role first and grant required privileges manually.

You can replace the following `<namespace>` field with your namespace, and you can also update the `ClusterRole` as `admin` or `view`.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: edit-user
  namespace: <namespace>
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: edit
subjects:
- kind: ServiceAccount
  name: edit-user
  namespace: kubernetes-dashboard
```

## Getting a long-lived Bearer Token for ServiceAccount

we can  create a token with the secret which bound the service account and the token will be saved in the Secret.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: edit-user
  namespace: kubernetes-dashboard
  annotations:
    kubernetes.io/service-account.name: "edit-user"   
type: kubernetes.io/service-account-token  
```

after we created the Secret, we can execute the following command to get the token which saved in the Secret.

```shell
kubectl get secret edit-user -n kubernetes-dashboard -o jsonpath={".data.token"} | base64 -d
```

you can also execute the following command to get the bearer token:

```bash
kubectl -n kubernetes-dashboard create token edit-user
```

## Accessing Dashboard

Now copy the token and paste it into the `Enter token` field on the login screen. Click the `Sign in` button and that's it. 

You are now logged in as an edit for `the namespace level`permissions.

![Sing in](../../images/signin.png)
