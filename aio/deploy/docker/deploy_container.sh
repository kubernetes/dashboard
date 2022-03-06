#!/bin/sh
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

docker run \
    -d --restart=always \
    -v "${HOME}/.kube/config":"/home/user/.kube/config" \
    -p 8080:9090 \
    -p 8443:8443 \
    -e K8S_DASHBOARD_KUBECONFIG=/home/user/.kube/config \
    -e K8S_OWN_CLUSTER=false  \
    --name dashboard kubernetesui/dashboard:latest /dashboard --insecure-bind-address=0.0.0.0 --bind-address=0.0.0.0 --kubeconfig=/home/user/.kube/config --enable-insecure-login=false --auto-generate-certificates --enable-skip-login=false
