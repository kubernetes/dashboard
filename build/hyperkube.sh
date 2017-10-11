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

ETCD_VERSION=v3.2.9
ETCD_DIR=/tmp/etcd
KUBECTL_BIN=/tmp/kubectl

set -x

# Download etcd.
mkdir -p ${ETCD_DIR}
curl -L https://github.com/coreos/etcd/releases/download/${ETCD_VERSION}/etcd-${ETCD_VERSION}-linux-amd64.tar.gz -o /tmp/etcd-${ETCD_VERSION}-linux-amd64.tar.gz
tar xzvf /tmp/etcd-${ETCD_VERSION}-linux-amd64.tar.gz -C ${ETCD_DIR} --strip-components=1

# Download kubectl.
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl -o ${KUBECTL_BIN}
sudo chmod +x ${KUBECTL_BIN}

# Install cfssl.
go get -u github.com/cloudflare/cfssl/cmd/...

# Download Kubernetes.
# TODO