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

set -o errexit
set -o nounset
set -o pipefail

DIFF_ROOT="../src"
TMP_DIFF_ROOT="../_tmp/src"
_tmp="../_tmp"

cleanup() {
  rm -rf "${_tmp}"
}

cleanup
trap "cleanup" EXIT SIGINT

mkdir -p "${TMP_DIFF_ROOT}"
cp -a "${DIFF_ROOT}"/* "${TMP_DIFF_ROOT}"

"./codegen-update.sh"
echo "diffing ${DIFF_ROOT} against freshly generated codegen"
ret=0
diff -Naupr "${DIFF_ROOT}" "${TMP_DIFF_ROOT}" || ret=$?
cp -a "${TMP_DIFF_ROOT}"/* "${DIFF_ROOT}"
if [[ $ret -eq 0 ]]
then
  echo "${DIFF_ROOT} up to date."
else
  echo "${DIFF_ROOT} is out of date. Please run codegen-update.sh"
  exit 1
fi

