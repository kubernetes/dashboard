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

# Create and switch user to "user" with same UID and GID as local.
groupadd -g ${LOCAL_GID} user
useradd -u ${LOCAL_UID} -g ${LOCAL_GID} -d /home/user user
chown -R user:user /home/user

# Add user as sudoer without password
echo "user ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers.d/user

# Execute command with gosu as user
GOSU="exec /usr/sbin/gosu user"

# Run command if K8S_DASHBOARD_CMD is set,
# otherwise run `npm ${K8S_DASHBOARD_NPM_CMD}`.
if [[ -n "${K8S_DASHBOARD_CMD}" ]] ; then
  # Run npm command
  echo "Run '${K8S_DASHBOARD_CMD}'"
  ${GOSU} ${K8S_DASHBOARD_CMD}
else
  ${GOSU} aio/develop/npm-command.sh
fi
