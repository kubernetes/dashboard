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

# Run npm command if K8S_DASHBOARD_NPM_CMD is set,
# otherwise start dashboard.
if [[ -n "${K8S_DASHBOARD_NPM_CMD}" ]] ; then
  # Run npm command
  echo "Run npm '${K8S_DASHBOARD_NPM_CMD}'"
  npm ${K8S_DASHBOARD_NPM_CMD} \
    --bind_address=${K8S_DASHBOARD_BIND_ADDRESS} \
    --sidecar_host=${K8S_DASHBOARD_SIDECAR_HOST} \
    --port=${K8S_DASHBOARD_PORT}
else
  if [[ "${K8S_OWN_CLUSTER}" != true ]] ; then
    # Stop cluster.
    echo "Stop cluster"
    sudo make stop-cluster
    # Start cluster.
    echo "Start cluster"
    sudo make start-cluster
    # Copy kubeconfig from /root/.kube/config
    sudo cat /root/.kube/config > /tmp/kind.kubeconfig
    sudo chown ${LOCAL_UID}:${LOCAL_GID} /tmp/kind.kubeconfig
    # Edit kubeconfig for kind
    KIND_CONTAINER_NAME="k8s-cluster-ci-control-plane"
    KIND_ADDR=$(sudo docker inspect -f='{{.NetworkSettings.Networks.kind.IPAddress}}' ${KIND_CONTAINER_NAME})
    sed -e "s/127.0.0.1:[0-9]\+/${KIND_ADDR}:6443/g" /tmp/kind.kubeconfig > ~/.kube/config
    # Deploy recommended.yaml to deploy dashboard-metrics-scraper sidecar
    echo "Deploy dashboard-metrics-scraper into kind cluster"
    kubectl apply -f aio/deploy/recommended.yaml
    # Kill and run `kubectl proxy`
    KUBECTL_PID=$(ps -A|grep 'kubectl'|tr -s ' '|cut -d ' ' -f 2)
    echo "Kill kubectl ${KUBECTL_PID}"
    kill ${KUBECTL_PID}
    nohup kubectl proxy --address 127.0.0.1 --port 8000 >/tmp/kubeproxy.log 2>&1 &
    export K8S_DASHBOARD_SIDECAR_HOST="http://localhost:8000/api/v1/namespaces/kubernetes-dashboard/services/dashboard-metrics-scraper:/proxy/"
    # Inform how to get token for logging in to dashboard
    echo "HOW TO GET TOKEN FOR LOGGING INTO DASHBOARD"
    echo "1. Run terminal for dashboard container."
    echo "  docker exec -it k8s-dashboard-dev gosu user bash"
    echo "2. Run following to get token for logging into dashboard."
    echo "  kubectl -n kubernetes-dashboard get secrets \$(kubectl -n kubernetes-dashboard get sa kubernetes-dashboard -ojsonpath=\"{.secrets[0].name}\") -ojsonpath=\"{.data.token}\" | echo \"\$(base64 -d)\""
  fi
  # Start dashboard.
  echo "Start dashboard in production mode"
  npm run start:prod \
    --bind_address=${K8S_DASHBOARD_BIND_ADDRESS} \
    --sidecar_host=${K8S_DASHBOARD_SIDECAR_HOST} \
    --port=${K8S_DASHBOARD_PORT}
fi
