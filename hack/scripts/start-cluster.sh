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
. "${ROOT_DIR}/aio/scripts/conf.sh"

function start-ci-heapster {
  say "\nRunning heapster in standalone mode"
  docker run --net=host -d k8s.gcr.io/heapster-amd64:${HEAPSTER_VERSION} \
             --heapster-port ${HEAPSTER_PORT} \
             --source=kubernetes:http://127.0.0.1:8080?inClusterConfig=false&auth=""

  say "\nWaiting for heapster to be started"
  for i in {1..150}
  do
    HEAPSTER_STATUS=$(curl -sb -H "Accept: application/json" "127.0.0.1:${HEAPSTER_PORT}/healthz")
    if [ "${HEAPSTER_STATUS}" == "ok" ]; then
      break
    fi
    sleep 2
  done
  say "\nHeapster is up and running"
}

function start-kind {
  ${KIND_BIN} create cluster --name="k8s-cluster-ci" --image="kindest/node:${K8S_VERSION}"
  ensure-kubeconfig
  if [ "${CI}" = true ] ; then
    start-ci-heapster
  fi
  say "\nKubernetes cluster is ready to use"
}

# Execute script.
ensure-cache
download-kind
start-kind
