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

set -x

# TODO Base directory, that needs to be cached.
BASE_DIR=/k8s
sudo mkdir -p ${BASE_DIR}
sudo chown -R $(whoami) ${BASE_DIR}

# Binaries location.
KUBECTL_BIN=${BASE_DIR}/kubectl
MINIKUBE_BIN=${BASE_DIR}/minikube

# Latest stable minikube version.
MINIKUBE_VERSION=v0.22.3

# Latest stable Kubernetes version.
K8S_VERSION=$(curl -sSL https://dl.k8s.io/release/stable.txt)

echo "Downloading minikube ${MINIKUBE_VERSION}"
curl -L https://storage.googleapis.com/minikube/releases/${MINIKUBE_VERSION}/minikube-linux-amd64 -o ${MINIKUBE_BIN}
chmod +x ${MINIKUBE_BIN}
${MINIKUBE_BIN} version

echo "Downloading kubectl ${K8S_VERSION}"
curl -L https://storage.googleapis.com/kubernetes-release/release/${K8S_VERSION}/bin/linux/amd64/kubectl -o ${KUBECTL_BIN}
chmod +x ${KUBECTL_BIN}
${KUBECTL_BIN} version --client

# Export environment variables required by minikube.
export MINIKUBE_WANTUPDATENOTIFICATION=false
export MINIKUBE_WANTREPORTERRORPROMPT=false
export MINIKUBE_HOME=$HOME
export CHANGE_MINIKUBE_NONE_USER=true

# Prepare environment.
mkdir -p $HOME/.kube
touch $HOME/.kube/config

echo "Starting Kubernetes ${K8S_VERSION}"
sudo -E ${MINIKUBE_BIN} start --vm-driver=none

echo "Waiting for the cluster to be started"
for i in {1..150}
do
 ${KUBECTL_BIN} get po &> /dev/null
 if [ $? -ne 1 ]; then
    break
 fi
    sleep 2
done
echo "Cluster is up and running"

# Deploy influxdb and heapster.
${KUBECTL_BIN} create -f https://raw.githubusercontent.com/kubernetes/heapster/master/deploy/kube-config/influxdb/influxdb.yaml
${KUBECTL_BIN} create -f https://raw.githubusercontent.com/kubernetes/heapster/master/deploy/kube-config/influxdb/heapster.yaml
