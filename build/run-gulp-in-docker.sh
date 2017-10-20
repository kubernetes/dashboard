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

# This is a script that runs gulp in a docker container,
# for machines that don't have nodejs, go and java installed.

DOCKER_RUN_OPTS=${DOCKER_RUN_OPTS:-}
DASHBOARD_IMAGE_NAME="kubernetes-dashboard-build-image"
DEFAULT_COMMAND=${DEFAULT_COMMAND:-"node_modules/.bin/gulp"}
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Always test if the image is up-to-date. If nothing has changed since last build,
# it'll just use the already-built image
docker build -t ${DASHBOARD_IMAGE_NAME} -f ${DIR}/Dockerfile ${DIR}/../

# Run gulp in the container in interactive mode and expose necessary ports automatically
docker run \
	-it \
	--rm \
	--net=host \
	-v /var/run/docker.sock:/var/run/docker.sock \
	${DOCKER_RUN_OPTS} \
	${DASHBOARD_IMAGE_NAME} \
	${DEFAULT_COMMAND} $@
