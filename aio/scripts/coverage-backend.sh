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
set -euo pipefail

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/aio/scripts/conf.sh"

function install-packages {
  say "\nInstall packages that are dependencies of the test to improve performance"
  go test -i github.com/kubernetes/dashboard/src/app/backend/...
  echo "OK!"
}

function create-coverage-report-file {
  say "\nCreate coverage report file"
  [ -e ${GO_COVERAGE_FILE} ] && rm ${GO_COVERAGE_FILE}
  mkdir -p "$(dirname ${GO_COVERAGE_FILE})" && touch ${GO_COVERAGE_FILE}
  echo "OK!"
}

function run-coverage-tests {
  say "\nRun coverage tests of all project packages"
  for PKG in $(go list github.com/kubernetes/dashboard/src/app/backend/... | grep -v vendor); do
    go test -coverprofile=profile.out -covermode=atomic ${PKG}
    if [ -f profile.out ]; then
        cat profile.out >> ${GO_COVERAGE_FILE}
        rm profile.out
    fi
  done
}

# Execute script.
install-packages
create-coverage-report-file
run-coverage-tests
