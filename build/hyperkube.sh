#!/bin/bash -e
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

# Starts local hypercube cluster in a Docker container.
# Learn more at https://github.com/kubernetes/community/blob/master/contributors/devel/local-cluster/docker.md

# Stable version of kubernetes to use.
export K8S_VERSION=$(curl -sS https://storage.googleapis.com/kubernetes-release/release/stable.txt)
# Version heapster to use.
HEAPSTER_VERSION="v1.2.0"
# Port of the heapster to serve on.
HEAPSTER_PORT=8082
export ARCH=amd64
docker run -d \
    --volume=/sys:/sys:rw \
    --volume=/var/lib/docker/:/var/lib/docker:rw \
    --volume=/var/lib/kubelet/:/var/lib/kubelet:rw,shared \
    --volume=/var/run:/var/run:rw \
    --net=host \
    --pid=host \
    --privileged \
    --name=kubelet \
    gcr.io/google_containers/hyperkube-${ARCH}:${K8S_VERSION} \
    /hyperkube kubelet \
        --hostname-override=127.0.0.1 \
        --api-servers=http://localhost:8080 \
        --kubeconfig=/etc/kubernetes/manifests \
        --cluster-dns=10.0.0.10 \
        --cluster-domain=cluster.local \
        --allow-privileged --v=2


# Runs Heapster in standalone mode
docker run --net=host -d gcr.io/google_containers/heapster:${HEAPSTER_VERSION} -port ${HEAPSTER_PORT} \
    --source=kubernetes:http://127.0.0.1:8080?inClusterConfig=false&auth=""
