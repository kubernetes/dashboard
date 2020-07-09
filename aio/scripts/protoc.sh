#!/usr/bin/env bash

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
source "${ROOT_DIR}/aio/scripts/conf.sh"
POD_RESOURCES_ALPHA="${ROOT_DIR}/pkg/api/v1/pod/proto/"

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
}

function kd::protoc-go::install() {
  go install github.com/gogo/protobuf/protoc-gen-gogo
}

function kd::protoc::generate() {
  local package=${1}

  protoc \
    --proto_path="${package}" \
    --go_out=plugins=grpc,paths=source_relative:"pkg/api/v1/pod/proto" \
    "${package}/route.proto"
}

kd::protoc::ensure
kd::protoc-go::install
kd::protoc::generate "${POD_RESOURCES_ALPHA}"
