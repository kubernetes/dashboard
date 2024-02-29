## Usage

[Helm](https://helm.sh) must be installed to use the charts. 
Please refer to Helm's [documentation](https://helm.sh/docs) to get started.

Once Helm has been set up correctly, add the repo as follows:

helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard

If you had already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the packages.  You can then run `helm search repo
kubernetes-dashboard` to see the charts.

To upgrade/install the chart in `kubernetes-dashboard` namespace:
    
    helm upgrade --install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard --create-namespace --namespace kubernetes-dashboard

To uninstall the chart:

    helm delete kubernetes-dashboard
