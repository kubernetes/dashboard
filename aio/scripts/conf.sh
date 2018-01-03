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

# Directories.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
AIO_DIR="${ROOT_DIR}/aio"
I18N_DIR="${ROOT_DIR}/i18n"
TMP_DIR="${ROOT_DIR}/.tmp"
SRC_DIR="${ROOT_DIR}/src"
FRONTEND_DIR="${TMP_DIR}/frontend"
FRONTEND_SRC="${SRC_DIR}/app/frontend"
DIST_DIR="${ROOT_DIR}/dist"
CACHE_DIR="${ROOT_DIR}/.cached_tools"
BACKEND_SRC_DIR="${ROOT_DIR}/src/app/backend"
COVERAGE_DIR="${ROOT_DIR}/coverage"

# Paths.
GO_COVERAGE_FILE="${ROOT_DIR}/coverage/coverage.go.txt"

# Binaries.
NG_BIN="${ROOT_DIR}/node_modules/.bin/ng"
GULP_BIN="${ROOT_DIR}/node_modules/.bin/gulp"
CLANG_FORMAT_BIN="${ROOT_DIR}/node_modules/.bin/clang-format"
SCSSFMT_BIN="${ROOT_DIR}/node_modules/.bin/scssfmt"
BEAUTIFY_BIN="${ROOT_DIR}/node_modules/.bin/js-beautify"
GLOB_RUN_BIN="${ROOT_DIR}/node_modules/.bin/glob-run"

# Global constants.
ARCH=$(uname | awk '{print tolower($0)}')

# Local cluster configuration (check start-cluster.sh script for more details).
HEAPSTER_VERSION="v1.4.0"
HEAPSTER_PORT=8082
MINIKUBE_VERSION=v0.24.1
MINIKUBE_K8S_VERSION=v1.8.0
MINIKUBE_BIN=${CACHE_DIR}/minikube-${MINIKUBE_VERSION}

# Setup logger.
ERROR_STYLE=`tput setaf 1`
INFO_STYLE=`tput setaf 2`
BOLD_STYLE=`tput bold`
RESET_STYLE=`tput sgr0`

function say { echo -e "${INFO_STYLE}${BOLD_STYLE}$@${RESET_STYLE}"; }
function saye { echo -e "${ERROR_STYLE}${BOLD_STYLE}$@${RESET_STYLE}"; }
