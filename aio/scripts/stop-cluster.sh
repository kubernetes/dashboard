#!/usr/bin/env bash
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

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/aio/scripts/conf.sh"

ensure-cache
download-kind

${KIND_BIN} delete cluster --name="k8s-cluster-ci"

# Restore the original kubeconfig and all's right
# with the world.
# ${HOME}/.kube/config is mounted in container for development,
# so we can not `mv` or `rm` it.
cat ${HOME}/.kube/config-unkind > ${HOME}/.kube/config
rm -f ${HOME}/.kube/config-unkind
