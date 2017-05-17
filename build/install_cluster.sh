#!/bin/bash

sudo su -
apt-get update && apt-get install -y apt-transport-https
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb http://apt.kubernetes.io/ kubernetes-xenial main
EOF
apt-get update
# Install docker if you don't have it already.
apt-get install -y docker-engine
apt-get install -y kubelet kubeadm kubectl kubernetes-cni
kubeadm init

cp /etc/kubernetes/admin.conf $HOME/
chown $(id -u):$(id -g) $HOME/admin.conf
export KUBECONFIG=$HOME/admin.conf

kubectl taint nodes --all node-role.kubernetes.io/master-
kubectl apply -f https://git.io/weave-kube-1.6
