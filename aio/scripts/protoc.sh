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

PROTOC_VERSION="libprotoc 3.13.0"
PROTOC_GEN_GO_VERSION="v1.25.0"

function kd::protoc::ensure() {
  if [[ -z "$(which protoc)" || "$(protoc --version)" != "${PROTOC_VERSION}" ]]; then
    echo "Generating protobuf requires ${PROTOC_VERSION}. Please download and"
    echo "install the platform appropriate Protobuf package for your OS: "
    echo
    echo "  https://github.com/google/protobuf/releases"
    echo
    echo "WARNING: Protobuf changes are not being validated"
    exit 1
  fi

  say "Found protoc: $(protoc --version)"
}

function kd::protoc-gen-go::install() {
  if [[ -z "$(which protoc-gen-go)" || "$(protoc-gen-go --version)" != "${PROTOC_GEN_GO_VERSION}" ]]; then
    say "Installing protoc-gen-go@${PROTOC_GEN_GO_VERSION}"
    go get -u google.golang.org/protobuf/cmd/protoc-gen-go@${PROTOC_GEN_GO_VERSION}
  else
    say "Found protoc-gen-go"
  fi
}

function kd::protoc-gen-go-grpc::install() {
  if [[ -z "$(which protoc-gen-go-grpc)" ]]; then
    say "Installing protoc-gen-go-grpc"
    go install google.golang.org/grpc/cmd/protoc-gen-go-grpc
    go mod tidy
  else
    say "Found protoc-gen-go-grpc"
  fi
}

function kd::protoc::generate() {
  local package=${1}
  readonly files=$(find "${package}" -name "*.proto")

  for proto in ${files}; do
    local baseDir="${proto%/*}"
    local filename="${proto##*/}"

    say "Generating Go file: ${filename%.*}.pb.go"
    say "Generating Go GRPC file: ${filename%.*}_grpc.pb.go"

    protoc \
      --proto_path="${baseDir}" \
      --go_out="${baseDir}" \
      --go_opt=paths=source_relative \
      --go-grpc_out="${baseDir}" \
      --go-grpc_opt=paths=source_relative \
      "${baseDir}/${filename}"
  done
}

kd::protoc::ensure
kd::protoc-gen-go::install
kd::protoc-gen-go-grpc::install
kd::protoc::generate "${SOURCE_DIR}"
