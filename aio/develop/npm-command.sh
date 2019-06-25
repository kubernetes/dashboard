#!/bin/bash

# Copyright 2019 The Kubernetes Authors.
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

# Run npm command if K8S_DASHBOARD_NPM_CMD is set,
# otherwise install and start dashboard.
if [[ -n "${K8S_DASHBOARD_NPM_CMD}" ]] ; then
  # Run npm command
  echo "Run npm '${K8S_DASHBOARD_NPM_CMD}'"
  npm ${K8S_DASHBOARD_NPM_CMD} --kubernetes-dashboard:bind_address=${K8S_DASHBOARD_BIND_ADDRESS}
else
  # Install dashboard.
  echo "Install dashboard"
  npm ci --unsafe-perm
  if [[ "${K8S_OWN_CLUSTER}" != true ]] ; then
    # Stop cluster.
    echo "Stop cluster"
    npm run cluster:stop
    # Start cluster.
    echo "Start cluster"
    npm run cluster:start
    # Edit kubeconfig for kind
    KIND_CONTAINER_NAME="k8s-cluster-ci-control-plane"
    KIND_ADDR=$(docker inspect -f='{{.NetworkSettings.IPAddress}}' ${KIND_CONTAINER_NAME})
    sed -e "s/localhost:[0-9]\+/${KIND_ADDR}:6443/g" kind.kubeconfig > kind.kubeconfig.new
    cat kind.kubeconfig.new > kind.kubeconfig
    rm -f kind.kubeconfig.new
  fi
  # Start dashboard.
  echo "Start dashboard"
  npm start --kubernetes-dashboard:bind_address=${K8S_DASHBOARD_BIND_ADDRESS}
fi
