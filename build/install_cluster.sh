

echo "add repo"
sudo sh -c "curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -"
sudo sh -c "echo 'deb http://apt.kubernetes.io/ kubernetes-xenial main' > /etc/apt/sources.list.d/kubernetes.list"
echo "update"
sudo apt-get update
# Install docker if you don't have it already.
echo "install"
sudo sh -c "apt-get install -y kubelet kubeadm kubectl kubernetes-cni"
echo "init"
sudo kubeadm init

cp /etc/kubernetes/admin.conf $HOME/
chown $(id -u):$(id -g) $HOME/admin.conf
export KUBECONFIG=$HOME/admin.conf

kubectl taint nodes --all node-role.kubernetes.io/master-
kubectl apply -f https://git.io/weave-kube-1.6
