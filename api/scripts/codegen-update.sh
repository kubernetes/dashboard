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

set -o errexit
set -o nounset
set -o pipefail

CODEGEN_VERSION="v0.23.6"
CODEGEN_BIN="${GOPATH}/pkg/mod/k8s.io/code-generator@${CODEGEN_VERSION}/generate-groups.sh"
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
SOURCE_DIR="${SCRIPT_DIR}/../src"
CODEGEN_DIR="${SCRIPT_DIR}/../codegen"

"${CODEGEN_BIN}" "deepcopy,client,informer,lister" \
  github.com/kubernetes/dashboard/api/src/plugin/client github.com/kubernetes/dashboard/api/src/plugin apis:v1alpha1 \
  --go-header-file "${SCRIPT_DIR}/../../aio/scripts/license-header.go.txt" --output-base "${CODEGEN_DIR}"

rm -rf "${SOURCE_DIR}/plugin/client"

mv "${CODEGEN_DIR}/github.com/kubernetes/dashboard/api/src/plugin/client" "${SOURCE_DIR}/plugin"
mv "${CODEGEN_DIR}/github.com/kubernetes/dashboard/api/src/plugin/apis/v1alpha1/zz_generated.deepcopy.go" "${SOURCE_DIR}/plugin/apis/v1alpha1"

rm -rf "${CODEGEN_DIR}"
