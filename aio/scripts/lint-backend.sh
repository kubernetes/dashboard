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

# Exit on error.
set -e

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/aio/scripts/conf.sh"

# Make sure that all required tools are available.
if [ ! -f ${GOLINT_BIN} ]; then
    curl -sfL ${GOLINT_URL} | sh -s -- -b ${CACHE_DIR} v1.12.3
fi

# Run checks.
${GOLINT_BIN} run ./... \
  --no-config \
  --issues-exit-code=0 \
  --deadline=30m \
  --disable-all \
  --enable=govet \
  --enable=gocyclo \
  --enable=misspell \
  --enable=ineffassign
