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

# Deploys Heapster in cluster.

PATH_ROOT=$(dirname "${BASH_SOURCE}")/
# Port of the apiserver to serve on.
PORT=8080

curl -X POST -d @${PATH_ROOT}/heapster-controller.json \
    http://localhost:${PORT}/api/v1/namespaces/kube-system/replicationcontrollers
curl -X POST -d @${PATH_ROOT}/heapster-service.json \
    http://localhost:${PORT}/api/v1/namespaces/kube-system/services
set -e
