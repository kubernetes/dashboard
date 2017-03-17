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
# Learn more at https://github.com/kubernetes/kubernetes/blob/master/docs/getting-started-guides/docker.md

# Version of kubernetes to use.
K8S_VERSION="v1.5.4"
# Version heapster to use.
HEAPSTER_VERSION="v1.2.0"
# Port of the heapster to serve on.
HEAPSTER_PORT=8082

docker run \
    --net=host \
    --pid=host \
    --privileged=true \
    -d \
    gcr.io/google_containers/hyperkube-amd64:${K8S_VERSION} \
    /nsenter \
      --target=1 \
      --mount \
      --wd=. \
      -- ./hyperkube kubelet \
        --allow-privileged=true \
        --hostname-override="127.0.0.1" \
        --address="0.0.0.0" \
        --api-servers=http://localhost:8080 \
        --config=etc/kubernetes/manifests \
        --v=2


# Runs Heapster in standalone mode
docker run --net=host -d gcr.io/google_containers/heapster:${HEAPSTER_VERSION} -port ${HEAPSTER_PORT} \
    --source=kubernetes:http://127.0.0.1:8080?inClusterConfig=false&auth=""
