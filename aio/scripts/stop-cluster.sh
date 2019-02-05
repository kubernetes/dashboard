. "./aio/scripts/conf.sh"

${KIND_BIN} delete cluster --name="k8s-cluster-ci"

# Restore the original kubeconfig and all's right
# with the world.
mv ${HOME}/.kube/config-unkind ${HOME}/.kube/config