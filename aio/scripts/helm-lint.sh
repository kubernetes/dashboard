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

# This script takes an argument: the tag name ("v1.2.3") to release from.

# Exit on error.
set -e;

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/aio/scripts/conf.sh"

cd "$AIO_DIR/deploy/helm-chart/kubernetes-dashboard"
say "\nBuildint Helm Chart dependencies..."
helm repo add stable https://kubernetes-charts.storage.googleapis.com/
helm dependency build
for VALUES_FILE in ci/*; do
  say "\nLinting and validating Helm Chart using $VALUES_FILE values file..."
  # Simple lint
  helm lint --values "$VALUES_FILE";

  # Validate all generated manifest against Kubernetes json schema
  mkdir helm-output;
  helm template --values "$VALUES_FILE" --output-dir helm-output .;
  find helm-output -type f -exec \
    kubeval \
    --kubernetes-version 1.16.0 \
    --schema-location https://raw.githubusercontent.com/instrumenta/kubernetes-json-schema/master \
    {} +;
  rm -rf helm-output;
done;
