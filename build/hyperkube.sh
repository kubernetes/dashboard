#!/bin/bash -e
# Copyright 2017 The Kubernetes Dashboard Authors.
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

curl -s https://raw.githubusercontent.com/Mirantis/kubeadm-dind-cluster/master/fixed/dind-cluster-v1.7.sh | bash /dev/stdin up

curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.8.0/bin/linux/amd64/kubectl
sudo chmod +x ./kubectl

./kubectl get nodes