#!/bin/bash

# Copyright 2015 Google Inc. All Rights Reserved.
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

# check sudo and enable mount propagation
main() {
  check_sudo
  if command_exists systemctl; then
    restart_docker_systemd
  else
    make_shared_kubelet_dir
  fi
}

# Ensure everything is OK, docker is running and we're root
check_sudo() {
  if [[ $(docker ps 2>&1 1>/dev/null; echo $?) != 0 ]]; then
    echo "Docker is not running on this machine!"
    exit 1
  fi
  if [[ "$(id -u)" != "0" ]]; then
    echo "Please run as root"
    exit 1
  fi
}

# Check if a command is valid
command_exists() {
    command -v "$@" > /dev/null 2>&1
}

# Set shared flag
restart_docker_systemd(){
  DOCKER_CONF=$(systemctl cat docker | head -1 | awk '{print $2}')
  sed -i.bak 's/^\(MountFlags=\).*/\1shared/' $DOCKER_CONF
  systemctl daemon-reload
  systemctl restart docker
}

# Make shared kubelet directory
make_shared_kubelet_dir() {
    mkdir -p /var/lib/kubelet
    mount --bind /var/lib/kubelet /var/lib/kubelet
    mount --make-shared /var/lib/kubelet
}

main
