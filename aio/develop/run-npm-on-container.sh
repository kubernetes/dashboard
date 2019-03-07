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

# This runs npm commands for dashboard in container.
#
# To run dashboard on container, simply run `run-npm-command.sh`.
# To run npm command in container, set K8S_DASHBOARD_NPM_CMD variable
# like "run check" or run like `run-npm-command.sh run check`.

CD="$(pwd)"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# K8S_DASHBOARD_NPM_CMD will be passed into container and will be used
# by run-npm-command.sh on container.
export K8S_DASHBOARD_NPM_CMD=$*

# Build and run container for dashboard
DASHBOARD_IMAGE_NAME=${K8S_DASHBOARD_CONTAINER_NAME:-"k8s-dashboard-dev-image"}
K8S_DASHBOARD_SRC=${K8S_DASHBOARD_SRC:-"${CD}"}
K8S_DASHBOARD_CONTAINER_NAME=${K8S_DASHBOARD_CONTAINER_NAME:-"k8s-dashboard-dev"}
K8S_DASHBOARD_SRC_ON_CONTAINER=/go/src/github.com/kubernetes/dashboard

echo "Remove existing container ${K8S_DASHBOARD_CONTAINER_NAME}"
docker rm -f ${K8S_DASHBOARD_CONTAINER_NAME}

# Always test if the image is up-to-date. If nothing has changed since last build,
# it'll just use the already-built image
echo "Start building container image for development"
docker build -t ${DASHBOARD_IMAGE_NAME} -f ${DIR}/Dockerfile ${DIR}/../../

# Run dashboard container for development and expose necessary ports automatically.
echo "Run container for development"
docker run \
	-it \
	--net=host \
	--name=${K8S_DASHBOARD_CONTAINER_NAME} \
	--cap-add=SYS_PTRACE \
	-v /var/run/docker.sock:/var/run/docker.sock \
	-v ${K8S_DASHBOARD_SRC}:${K8S_DASHBOARD_SRC_ON_CONTAINER} \
	-v ${K8S_DASHBOARD_KUBECONFIG}:/root/.kube/config \
	-e K8S_DASHBOARD_NPM_CMD="${K8S_DASHBOARD_NPM_CMD}" \
	${DOCKER_RUN_OPTS} \
	${DASHBOARD_IMAGE_NAME}
