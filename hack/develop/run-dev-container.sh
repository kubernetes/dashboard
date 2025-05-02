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

# This prepares development environment for Kubernetes Dashboard in Docker.

CD="$(pwd)"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# User and group ID to execute commands.
LOCAL_UID=$(id -u)
LOCAL_GID=$(id -g)
DOCKER_GID=$(getent group docker|cut -d ":" -f 3)

# kubeconfig for dashboard.
# This will be mounted and certain npm command can modify it,
# so this should not be set for original kubeconfig.
if [[ -n "${KD_DEV_KUBECONFIG}" ]] ; then
  # Use your own kubernetes cluster.
  K8S_OWN_CLUSTER=true
else
  # Use the kind cluster that will be created later by the script.
  # Set defult as kubeconfig made by `hack/scripts/start-cluster.sh`.
  touch /tmp/kind.kubeconfig
  KD_DEV_KUBECONFIG=/tmp/kind.kubeconfig
fi

# Create docker network to work with kind cluster
KD_DEV_NETWORK="kubernetes-dashboard"
docker network create ${KD_DEV_NETWORK} \
  -d=bridge \
  -o com.docker.network.bridge.enable_ip_masquerade=true \
  -o com.docker.network.driver.mtu=1500

# Bind address for dashboard
KD_DEV_BIND_ADDRESS=${KD_DEV_BIND_ADDRESS:-"127.0.0.1"}

# Metrics Scraper sidecar host for dashboard
KD_DEV_SIDECAR_HOST=${KD_DEV_SIDECAR_HOST:-"http://localhost:8000"}

# Build and run container for dashboard
KD_DEV_IMAGE_NAME=${KD_DEV_CONTAINER_NAME:-"k8s-dashboard-dev-image"}
KD_DEV_SRC=${KD_DEV_SRC:-"${CD}"}
KD_DEV_CONTAINER_NAME=${KD_DEV_CONTAINER_NAME:-"k8s-dashboard-dev"}
KD_DEV_SRC_ON_CONTAINER=/go/src/github.com/kubernetes/dashboard

echo "Remove existing container ${KD_DEV_CONTAINER_NAME}"
docker rm -f ${KD_DEV_CONTAINER_NAME}

# Always test if the image is up-to-date. If nothing has changed since last build,
# it'll just use the already-built image
echo "Start building container image for development"
docker build -t ${KD_DEV_IMAGE_NAME} -f ${DIR}/Dockerfile ${DIR}/../../

# Run dashboard container for development and expose necessary ports automatically.
echo "Run container for development"
docker run \
  -it \
  --name=${KD_DEV_CONTAINER_NAME} \
  --cap-add=SYS_PTRACE \
  --network=${KD_DEV_NETWORK} \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ${KD_DEV_SRC}:${KD_DEV_SRC_ON_CONTAINER} \
  -v ${KD_DEV_KUBECONFIG}:/home/user/.kube/config \
  -e KD_DEV_CMD="${KD_DEV_CMD}" \
  -e K8S_OWN_CLUSTER=${K8S_OWN_CLUSTER} \
  -e BIND_ADDRESS=${KD_DEV_BIND_ADDRESS} \
  -e KUBECONFIG=${KD_DEV_KUBECONFIG} \
  -e KIND_EXPERIMENTAL_DOCKER_NETWORK=${KD_DEV_NETWORK} \
  -e SIDECAR_HOST=${KD_DEV_SIDECAR_HOST} \
  -e LOCAL_UID="${LOCAL_UID}" \
  -e LOCAL_GID="${LOCAL_GID}" \
  -e DOCKER_GID="${DOCKER_GID}" \
  -p 8080:8080 \
  ${DOCKER_RUN_OPTS} \
  ${KD_DEV_IMAGE_NAME}
