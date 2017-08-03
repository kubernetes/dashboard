### Older kubernetes versions
If you are using Kubernetes 1.5 or earlier, you can install the latest stable release by running the following command:
```shell
$ kubectl create -f https://git.io/kube-dashboard-no-rbac
```
**IMPORATNT:** Please keep in mind that this will only work if RBACs are disabled in your cluster.