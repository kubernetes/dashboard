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
source "${ROOT_DIR}/aio/scripts/conf.sh"

SOURCE_DIR="${ROOT_DIR}/pkg/api"

function kd::protoc::ensure() {
  if [[ -z "$(which protoc)" || "$(protoc --version)" != "libprotoc 3."* ]]; then
    echo "Generating protobuf requires protoc 3.0.0-beta1 or newer. Please download and"
    echo "install the platform appropriate Protobuf package for your OS: "
    echo
    echo "  https://github.com/google/protobuf/releases"
    echo
    echo "WARNING: Protobuf changes are not being validated"
    exit 1
  fi

  say "Found protoc: $(protoc --version)"
}

function kd::protoc-go::install() {
  if [[ -z "$(which protoc-gen-gogo)" ]]; then
    echo "Installing protoc-gen-gogo"
    go install github.com/gogo/protobuf/protoc-gen-gogo
  fi

  say "Found protoc-gen-gogo"
}

function kd::protoc::generate() {
  local package=${1}
  readonly files=$(find "${package}" -name "*.proto")

  for proto in ${files}; do
    local baseDir="${proto%/*}"
    local filename="${proto##*/}"
    say "Generating proto file: ${filename}"

    protoc \
      --proto_path="${baseDir}" \
      --go_out=plugins=grpc,paths=source_relative:"${baseDir}" \
      "${baseDir}/${filename}"
  done
}

kd::protoc::ensure
kd::protoc-go::install
kd::protoc::generate "${SOURCE_DIR}"
