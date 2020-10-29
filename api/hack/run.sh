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

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[@]}")" && pwd -P)"
cd "${SCRIPT_DIR}/.."

go run github.com/kubernetes/dashboard/pkg/cmd \
  --kubeconfig="${KUBECONFIG:-${HOME}/.kube/config}" \
  --port="${PORT:-8080}" \
  --bind-address="${BIND_ADDRESS:-127.0.0.1}" \
  --sidecar-host="${SIDECAR_HOST:-http://localhost:8000}" \
  --enable-reflection-api="${ENABLE_REFLECTION_API:-false}"
