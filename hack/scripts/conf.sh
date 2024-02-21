#!/usr/bin/env bash
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

# Directories.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
AIO_DIR="${ROOT_DIR}/hack"
DIST_DIR="${ROOT_DIR}/.dist"
WEB_DIST_DIR="${DIST_DIR}/web"
CACHE_DIR="${ROOT_DIR}/.cached_tools"
ARCHITECTURES=(amd64 arm64 arm ppc64le s390x)
RELEASE_VERSION=2.5.0

# Global constants.
ARCH=$(uname | awk '{print tolower($0)}')

# Local cluster configuration (check start-cluster.sh script for more details).
HEAPSTER_VERSION="v1.5.4"
HEAPSTER_PORT=8082
KIND_VERSION="v0.19.0"
K8S_VERSION="v1.29.2"
KIND_BIN=${CACHE_DIR}/kind-${KIND_VERSION}

function ensure-cache {
  echo "\nMaking sure that ${CACHE_DIR} directory exists"
  mkdir -p ${CACHE_DIR}
}

function download-kind {
  KIND_URL="https://github.com/kubernetes-sigs/kind/releases/download/${KIND_VERSION}/kind-${ARCH}-amd64"
  echo "\nDownloading kind ${KIND_URL} if it is not cached"
  wget -nc -O ${KIND_BIN} ${KIND_URL}
  chmod +x ${KIND_BIN}
  ${KIND_BIN} version
}

function ensure-kubeconfig {
  echo "\nMaking sure that kubeconfig file exists and will be used by Dashboard"
  mkdir -p ${HOME}/.kube
  touch ${HOME}/.kube/config

  # Let's back up the kubeconfig so we don't totally blow it away
  # I learned from personal experience. It made me sad. :(
  # ${HOME}/.kube/config is mounted in container for development,
  # so we can not `mv` or `rm` it.
  cp ${HOME}/.kube/config ${HOME}/.kube/config-unkind

  ${KIND_BIN} get kubeconfig --name="k8s-cluster-ci" > ${HOME}/.kube/config
}
