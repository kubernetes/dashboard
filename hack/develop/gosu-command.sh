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

# Install latest npm-check-updates
npm i -g npm-check-updates

# Create and switch user to "user" with same UID and GID as local.
if [[ -z "$(cat /etc/group | grep ':${LOCAL_GID}:')" ]] ; then
  groupadd -g ${LOCAL_GID} user
fi
useradd -u ${LOCAL_UID} -g ${LOCAL_GID} -d /home/user user
chown -R ${LOCAL_UID}:${LOCAL_GID} /home/user

# Create docker group and add user to docker group, if group its ID provided
if [ -v DOCKER_GID ]; then
  groupadd -g ${DOCKER_GID} docker
  usermod -aG docker user
fi

# Add user as sudoer without password
echo "user ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers.d/user

# Execute command with gosu as user
GOSU="exec /usr/sbin/gosu user"

# Run command if KD_DEV_CMD is set,
# otherwise run dashboard with `make run` with k8s cluster.
if [[ -n "${KD_DEV_CMD}" ]] ; then
  # Run specified command
  echo "Run '${KD_DEV_CMD}'"
  ${GOSU} ${KD_DEV_CMD}
else
  # Run dashboard with k8s cluster
  ${GOSU} hack/develop/run-command.sh
fi
