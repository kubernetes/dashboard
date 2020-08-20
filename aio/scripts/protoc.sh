#!/usr/bin/env bash

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
