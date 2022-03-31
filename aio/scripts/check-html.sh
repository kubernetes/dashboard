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

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE}")/../.." && pwd -P)"
source "${ROOT_DIR}/aio/scripts/conf.sh"

CODE=0
FILES=($(find ${SRC_DIR} -type f -name '*.html'))
for FILE in "${FILES[@]}"; do
  CONTENT=$(cat ${FILE})
  FORMATTED_CONTENT=$(npx html-beautify -f "${FILE}")
  OK=$(diff <(echo "${FORMATTED_CONTENT}") <(echo "${CONTENT}"))
  if [[ ! -z "${OK}" ]]; then
    CODE=1
    saye "$FILE - error"
  else
    say "$FILE - ok"
  fi
done

exit $CODE
