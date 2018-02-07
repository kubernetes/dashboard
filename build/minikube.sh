#!/bin/bash
# Copyright 2017 The Kubernetes Authors.
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

BASE_DIR=.tools/k8s
HEAPSTER_VERSION="v1.4.0"
HEAPSTER_PORT=8082
MINIKUBE_VERSION=v0.22.3
MINIKUBE_K8S_VERSION=v1.8.0
MINIKUBE_BIN=${BASE_DIR}/minikube-${MINIKUBE_VERSION}

echo "Making sure that ${BASE_DIR} directory exists"
mkdir -p ${BASE_DIR}

echo "Downloading minikube ${MINIKUBE_VERSION} if it is not cached"
wget -nc -O ${MINIKUBE_BIN} https://storage.googleapis.com/minikube/releases/${MINIKUBE_VERSION}/minikube-linux-amd64
chmod +x ${MINIKUBE_BIN}
${MINIKUBE_BIN} version

echo "Making sure that kubeconfig file exists and will be used by Dashboard"
mkdir -p $HOME/.kube
touch $HOME/.kube/config

echo "Starting minikube"
export MINIKUBE_WANTUPDATENOTIFICATION=false
export MINIKUBE_WANTREPORTERRORPROMPT=false
export MINIKUBE_HOME=${HOME}
export CHANGE_MINIKUBE_NONE_USER=true
sudo -E ${MINIKUBE_BIN} start --vm-driver=none --kubernetes-version ${MINIKUBE_K8S_VERSION}

echo "Running heapster in standalone mode"
docker run --net=host -d k8s.gcr.io/heapster-amd64:${HEAPSTER_VERSION} \
           --heapster-port ${HEAPSTER_PORT} \
           --source=kubernetes:http://127.0.0.1:8080?inClusterConfig=false&auth=""

echo "Waiting for heapster to be started"
for i in {1..150}
do
  HEAPSTER_STATUS=$(curl -sb -H "Accept: application/json" "127.0.0.1:${HEAPSTER_PORT}/healthz")
  if [ "$HEAPSTER_STATUS" == "ok" ]; then
    break
  fi
  sleep 2
done
echo "Heapster is up and running"

echo "Kubernetes is ready to use"
