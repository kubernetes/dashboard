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
. "${ROOT_DIR}/aio/scripts/conf.sh"

# Collect current localized files
languages=($(find "${I18N_DIR}"/* -type d -exec basename {} \;))
for language in "${languages[@]}"; do
  if [ ! -L "${I18N_DIR}/${language}/messages.${language}.xlf" ]; then
    say "Move translation file messages.${language}.xlf to be merged by xliffmerge."
    mv "${I18N_DIR}/${language}/messages.${language}.xlf" "${I18N_DIR}"
  fi
done

# Merge generated messages file into localized files.
xliffmerge

# Deliver merged localized files into each locale directories.
for language in "${languages[@]}"; do
  if [ -e "${I18N_DIR}/messages.${language}.xlf" ]; then
    say "Move merged file i18n/messages.${language}.xlf to i18n/${language}"
    mv "${I18N_DIR}/messages.${language}.xlf" "${I18N_DIR}/${language}"
  fi
done
