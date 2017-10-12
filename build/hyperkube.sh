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

ARCH=amd64
BASE_DIR=/tmp # TODO Cache.
ETCD_VERSION=v3.2.9
ETCD_DIR=${BASE_DIR}/etcd
K8S_VERSION=$(curl -sSL https://dl.k8s.io/release/stable.txt)
KUBECTL_BIN=${BASE_DIR}/kubectl
KUBEADM_BIN=${BASE_DIR}/kubeadm

set -x

# Download etcd.
mkdir -p ${ETCD_DIR}
curl -L https://github.com/coreos/etcd/releases/download/${ETCD_VERSION}/etcd-${ETCD_VERSION}-linux-amd64.tar.gz -o /tmp/etcd-${ETCD_VERSION}-linux-amd64.tar.gz
tar xzvf /tmp/etcd-${ETCD_VERSION}-linux-amd64.tar.gz -C ${ETCD_DIR} --strip-components=1

# Install cfssl.
go get -u github.com/cloudflare/cfssl/cmd/...

# Download and setup kubectl.
curl -L https://storage.googleapis.com/kubernetes-release/release/${K8S_VERSION}/bin/linux/${ARCH}/kubectl -o ${KUBECTL_BIN}
sudo chmod +x ${KUBECTL_BIN}
${KUBECTL_BIN} config set-credentials myself --username=admin --password=admin
${KUBECTL_BIN} config set-context local --cluster=local --user=myself
${KUBECTL_BIN} config set-cluster local --server=http://localhost:8080
${KUBECTL_BIN} config use-context local

# Download and setup kubeadm.
curl -sSL https://dl.k8s.io/release/${K8S_VERSION}/bin/linux/${ARCH}/kubeadm > ${KUBEADM_BIN}
chmod a+rx ${KUBECTL_BIN}

${KUBEADM_BIN} version
# TODO
