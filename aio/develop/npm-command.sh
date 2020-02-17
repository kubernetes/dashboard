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

# Install dependencies
echo "Install dependencies"
npm ci
aio/scripts/install-codegen.sh

# Run npm command if K8S_DASHBOARD_NPM_CMD is set,
# otherwise start dashboard.
if [[ -n "${K8S_DASHBOARD_NPM_CMD}" ]] ; then
  # Run npm command
  echo "Run npm '${K8S_DASHBOARD_NPM_CMD}'"
  npm ${K8S_DASHBOARD_NPM_CMD} \
    --kubernetes-dashboard:bind_address=${K8S_DASHBOARD_BIND_ADDRESS} \
    --kubernetes-dashboard:sidecar_host=${K8S_DASHBOARD_SIDECAR_HOST} \
    --kubernetes-dashboard:port=${K8S_DASHBOARD_PORT}
else
  if [[ "${K8S_OWN_CLUSTER}" != true ]] ; then
    # Stop cluster.
    echo "Stop cluster"
    sudo npm run cluster:stop
    # Start cluster.
    echo "Start cluster"
    sudo npm run cluster:start
    # Copy kubeconfig from /root/.kube/config
    sudo cat /root/.kube/config > /tmp/kind.kubeconfig
    sudo chown ${LOCAL_UID}:${LOCAL_GID} /tmp/kind.kubeconfig
    # Edit kubeconfig for kind
    KIND_CONTAINER_NAME="k8s-cluster-ci-control-plane"
    KIND_ADDR=$(sudo docker inspect -f='{{.NetworkSettings.IPAddress}}' ${KIND_CONTAINER_NAME})
    sed -e "s/localhost:[0-9]\+/${KIND_ADDR}:6443/g" /tmp/kind.kubeconfig > ~/.kube/config
    # Deploy recommended.yaml to deploy dashboard-metrics-scraper sidecar
    echo "Deploy dashboard-metrics-scraper into kind cluster"
    kubectl apply -f aio/deploy/recommended.yaml
    # Kill and run `kubectl proxy`
    KUBECTL_PID=$(ps -A|grep 'kubectl'|tr -s ' '|cut -d ' ' -f 2)
    echo "Kill kubectl ${KUBECTL_PID}"
    kill ${KUBECTL_PID}
    nohup kubectl proxy --address 127.0.0.1 --port 8000 >/tmp/kubeproxy.log 2>&1 &
    export K8S_DASHBOARD_SIDECAR_HOST="http://localhost:8000/api/v1/namespaces/kubernetes-dashboard/services/dashboard-metrics-scraper:/proxy/"
  fi
  # Start dashboard.
  echo "Start dashboard"
  npm start \
    --kubernetes-dashboard:bind_address=${K8S_DASHBOARD_BIND_ADDRESS} \
    --kubernetes-dashboard:sidecar_host=${K8S_DASHBOARD_SIDECAR_HOST} \
    --kubernetes-dashboard:port=${K8S_DASHBOARD_PORT}
fi
