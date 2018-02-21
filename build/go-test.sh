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

# Script parameters.
COVERAGE_REPORT_FILE=${1}
MAIN_PKG_NAME=${2}

# Install packages that are dependencies of the test. Do not run the test. Improves performance.
go test -i ${MAIN_PKG_NAME}/...

# Create coverage report file.
set -e
[ -e ${COVERAGE_REPORT_FILE} ] && rm ${COVERAGE_REPORT_FILE}
mkdir -p "$(dirname ${COVERAGE_REPORT_FILE})" && touch ${COVERAGE_REPORT_FILE}

# Run coverage tests of all project packages (without -race parameter to improve performance).
for PKG in $(go list ${MAIN_PKG_NAME}/... | grep -v vendor); do
    go test -coverprofile=profile.out -covermode=atomic ${PKG}
    if [ -f profile.out ]; then
        cat profile.out >> ${COVERAGE_REPORT_FILE}
        rm profile.out
    fi
done
