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
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../../.. && pwd -P)"
. "${ROOT_DIR}/hack/scripts/conf.sh"

ANGULAR_DIST_DIR="${WEB_DIST_DIR}/angular"
GO_MODULE_NAME="k8s.io/dashboard/web"
GO_BINARY_NAME="dashboard-web"

function clean {
  rm -rf "${WEB_DIST_DIR}"
}

function build::frontend {
  say "Building localized frontend"
  mkdir -p "${ANGULAR_DIST_DIR}"

  npx ng build \
          --configuration production \
          --localize \
          --outputPath="${ANGULAR_DIST_DIR}"

  # Avoid locale caching due to the same output file naming
  # We'll add language code prefix to the generated main javascript file.
  languages=($(ls "${ANGULAR_DIST_DIR}"))
  for language in "${languages[@]}"; do
    localeDir=${ANGULAR_DIST_DIR}/${language}
    filename=("$(find "${localeDir}" -name 'main.*.js' -exec basename {} \;)")

    mv "${localeDir}/${filename}" "${localeDir}/${language}.${filename}"
    perl -i -pe"s/${filename}/${language}.${filename}/" "${localeDir}/index.html"
  done

  cp "${WEB_DIR}/i18n/locale_conf.json" "${ANGULAR_DIST_DIR}"
}

function build::backend {
  say "Building backend"
  CGO_ENABLED=0 go build -ldflags "-X ${GO_MODULE_NAME}/client.Version=${RELEASE_VERSION})" -gcflags="all=-N -l" -o ${WEB_DIST_DIR}/${DEFAULT_ARCHITECTURE}/${GO_BINARY_NAME} ${GO_MODULE_NAME}
}

function build::backend::cross {
  say "Building backends for all supported architectures"
    languages=($(ls ${ANGULAR_DIST_DIR}))
    for arch in "${ARCHITECTURES[@]}"; do
      for language in "${languages[@]}"; do
        OUT_DIR=${DIST_DIR}/${arch}/public
        mkdir -p ${OUT_DIR}
        cp -r ${WEB_DIST_DIR}/${language} ${OUT_DIR}
      done
    done
}

function copy::frontend {
  say "Copying frontend to backend dist dir"
  languages=($(ls ${ANGULAR_DIST_DIR}))
  for arch in "${ARCHITECTURES[@]}"; do
    for language in "${languages[@]}"; do
      OUT_DIR=${WEB_DIST_DIR}/${arch}/public
      mkdir -p ${OUT_DIR}
      cp -r ${ANGULAR_DIST_DIR}/${language} ${OUT_DIR}
    done
  done
}

function copy::supported-locales {
  say "Copying locales file to backend dist dirs"
  for arch in "${ARCHITECTURES[@]}"; do
    OUT_DIR=${DIST_DIR}/${arch}
    cp ${I18N_DIR}/locale_conf.json ${OUT_DIR}
  done
}

function copy::dockerfile {
  say "Copying Dockerfile to backend dist dirs"
  for arch in "${ARCHITECTURES[@]}"; do
    OUT_DIR=${DIST_DIR}/${arch}
    cp ${AIO_DIR}/Dockerfile ${OUT_DIR}
  done
}

function parse::args {
  POSITIONAL=()
  while [[ $# -gt 0 ]]; do
    key="$1"
    case ${key} in
      -c|--cross)
      CROSS=true
      shift
      ;;
      --frontend-only)
      FRONTEND_ONLY=true
      shift
      ;;
    esac
  done
  set -- "${POSITIONAL[@]}" # Restore positional parameters.
}

# Execute script.
START=$(date +%s)

clean
build::frontend
build::backend
copy::frontend

END=$(date +%s)
TOOK=$(echo "${END} - ${START}" | bc)
say "Build finished successfully after ${TOOK}s"
