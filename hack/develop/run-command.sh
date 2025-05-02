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

ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"

# Create `kind` cluster if kubeconfig for own cluster is not set.
if [[ "${K8S_OWN_CLUSTER}" != true ]] ; then
  # Stop `kind` cluster.
  echo "Stop kind cluster"
  hack/scripts/stop-cluster.sh
  # Start `kind` cluster.
  echo "Start kind cluster in docker network named kubernetes-dashboard"
  hack/scripts/start-cluster.sh
  # Copy kubeconfig from /home/user/.kube/config
  cat /home/user/.kube/config > /tmp/kind.kubeconfig
  # Edit kubeconfig for kind
  KIND_CONTAINER_NAME="k8s-cluster-ci-control-plane"
  KIND_ADDR=$(sudo docker inspect -f='{{(index .NetworkSettings.Networks "kubernetes-dashboard").IPAddress}}' ${KIND_CONTAINER_NAME})
  sed -e "s/0.0.0.0:[0-9]\+/${KIND_ADDR}:6443/g" /tmp/kind.kubeconfig > /home/user/.kube/config
  # Copy kubeconfig from /home/user/.kube/config again.
  cat /home/user/.kube/config > /tmp/kind.kubeconfig
  # Deploy recommended.yaml to deploy dashboard-metrics-scraper sidecar
  echo "Deploy dashboard and dashboard-metrics-scraper into kind cluster"
  kubectl apply -f charts/recommended.yaml
  # Add role for development
  echo "Add full access role for development"
  kubectl apply -f hack/develop/developmental-role.yaml
  echo "@@@@@@@@@@@@@@ CAUTION!! @@@@@@@@@@@@@@"
  echo "ADDED FULL ACCESS ROLE FOR DEVELOPMENT!"
  echo "DO NOT USE THIS IN OPEN NETWORK!"
  echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
  # Kill and run `kubectl proxy`
  KUBECTL_PID=$(ps -A|grep 'kubectl'|tr -s ' '|cut -d ' ' -f 2)
  echo "Kill kubectl ${KUBECTL_PID}"
  kill ${KUBECTL_PID}
  nohup kubectl proxy --address 127.0.0.1 --port 8000 >/tmp/kubeproxy.log 2>&1 &
  export SIDECAR_HOST="http://localhost:8000/api/v1/namespaces/kubernetes-dashboard/services/dashboard-metrics-scraper:/proxy/"
  # Inform how to get token for logging in to dashboard
  echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
  echo "HOW TO GET TOKEN FOR LOGGING INTO DASHBOARD"
  echo ""
  echo "1. Run terminal for dashboard container."
  echo "  docker exec -it k8s-dashboard-dev gosu user bash"
  echo ""
  echo "2. Run following to get token for logging into dashboard."
  echo "  kubectl -n kubernetes-dashboard create token kubernetes-dashboard"
  echo ""
  echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
fi

# Clean install dependencies
cd modules/web
rm -fr node_modules
yarn
cd ${ROOT_DIR}

# Start dashboard.
echo "Start dashboard in production mode"
make run
