#!/bin/bash -e
# Copyright 2017 The Kubernetes Dashboard Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# TODO Base directory that needs to be cached.
#BASE_DIR=/tmp

# TODO
#ARCH=amd64
#K8S_VERSION=$(curl -sSL https://dl.k8s.io/release/stable.txt)
#KUBECTL_BIN=${BASE_DIR}/kubectl

# Download and setup kubectl.
#curl -L https://storage.googleapis.com/kubernetes-release/release/${K8S_VERSION}/bin/linux/${ARCH}/kubectl -o ${KUBECTL_BIN}
#sudo chmod +x ${KUBECTL_BIN}


# Binaries locations.
#KUBEADM_BIN=${BASE_DIR}/kubeadm

set -x

curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && chmod +x minikube
curl -Lo kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl && chmod +x kubectl

export MINIKUBE_WANTUPDATENOTIFICATION=false
export MINIKUBE_WANTREPORTERRORPROMPT=false
export MINIKUBE_HOME=$HOME
export CHANGE_MINIKUBE_NONE_USER=true
mkdir $HOME/.kube || true
touch $HOME/.kube/config

export KUBECONFIG=$HOME/.kube/config
sudo -E ./minikube start --vm-driver=none

# this for loop waits until kubectl can access the api server that Minikube has created
for i in {1..150} # timeout for 5 minutes
do
   ./kubectl get po &> /dev/null
   if [ $? -ne 1 ]; then
      break
  fi
  sleep 2
done

# kubectl commands are now able to interact with Minikube cluster









# TODO
