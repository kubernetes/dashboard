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

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/hack/scripts/conf.sh"

function start-kind {
  ${KIND_BIN} create cluster --name="k8s-cluster-ci" --image="kindest/node:${K8S_VERSION}" --config="${ROOT_DIR}/hack/scripts/kind-config"
  ensure-kubeconfig
  echo "\nKubernetes cluster is ready to use"
}

# Execute script.
ensure-cache
download-kind
start-kind
