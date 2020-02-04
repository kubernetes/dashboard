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

# Collect current localized files
languages=($(find i18n/* -type d|cut -d"/" -f2))
for language in "${languages[@]}"; do
  if [ ! -L i18n/${language}/messages.${language}.xlf ]; then
    echo "Move translation file messages.${language}.xlf to be merged by xliffmerge."
    mv i18n/${language}/messages.${language}.xlf i18n
  fi
done

# Merge generated messages file into localized files.
xliffmerge

# Deliver merged localized files into each locale directories.
for language in "${languages[@]}"; do
  if [ -e i18n/messages.${language}.xlf ]; then
    echo "Move merged file i18n/messages.${language}.xlf to i18n/${language}"
    mv i18n/messages.${language}.xlf i18n/${language}
  fi
done
