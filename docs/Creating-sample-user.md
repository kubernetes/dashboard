In this guide, we will find out how to create a new user using Service Account mechanism of Kubernetes, grant this user admin permissions and log in to Dashboard using bearer token tied to this user.

Copy provided snippets to some `xxx.yaml` file and use `kubectl create -f xxx.yaml` to create them.

## Create Service Account

We are creating Service Account with name `admin-user` in namespace `kube-system` first.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
```

## Create ClusterRoleBinding

In most cases after provisioning our cluster using `kops` or `kubeadm` or any other popular tool admin `Role` already exists in the cluster. We can use it and create only `RoleBinding` for our `ServiceAccount`.

**NOTE**: `apiVersion` of `ClusterRoleBinding` resource may differ between Kubernetes versions. Starting from `v1.8` it was promoted to `rbac.authorization.k8s.io/v1`.

```yaml
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
```

## Bearer Token

Now we need to find token we can use to log in. Execute following command:
```bash
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
```

It should print something like:
```bash
Name:         admin-user-token-6gl6l
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name=admin-user
              kubernetes.io/service-account.uid=b16afba9-dfec-11e7-bbb9-901b0e532516

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1025 bytes
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTZnbDZsIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJiMTZhZmJhOS1kZmVjLTExZTctYmJiOS05MDFiMGU1MzI1MTYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.M70CU3lbu3PP4OjhFms8PVL5pQKj-jj4RNSLA4YmQfTXpPUuxqXjiTf094_Rzr0fgN_IVX6gC4fiNUL5ynx9KU-lkPfk0HnX8scxfJNzypL039mpGt0bbe1IXKSIRaq_9VW59Xz-yBUhycYcKPO9RM2Qa1Ax29nqNVko4vLn1_1wPqJ6XSq3GYI8anTzV8Fku4jasUwjrws6Cn6_sPEGmL54sq5R4Z5afUtv-mItTmqZZdxnkRqcJLlg2Y8WbCPogErbsaCDJoABQ7ppaqHetwfM_0yMun6ABOQbIwwl8pspJhpplKwyo700OSpvTT9zlBsu-b35lzXGBRHzv5g_RA
```

Now copy the token and paste it into `Enter token` field on log in screen.
![zrzut ekranu z 2017-12-14 10-58-28](https://user-images.githubusercontent.com/2285385/33986408-c3a8af98-e0bd-11e7-9a59-608c30b8a5ea.png)

Click `Sign in` button and that's it. You are now logged in as an admin.

![zrzut ekranu z 2017-12-14 10-59-31](https://user-images.githubusercontent.com/2285385/33986449-e329f4a8-e0bd-11e7-92e2-86b7191af08c.png)

In order to find out more about how to grant/deny permissions in Kubernetes read official [authentication](https://kubernetes.io/docs/admin/authentication/) & [authorization](https://kubernetes.io/docs/admin/authorization/) documentation.