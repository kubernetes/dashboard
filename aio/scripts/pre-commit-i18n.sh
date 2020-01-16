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

# Extract i18n messages for update check.
# TODO(shu-mutou): outFile path should be fixed.
#                  `ng xi18n` seems ./aio directory as project root.
ng xi18n --outFile ../i18n/messages.new.xlf

# Generate MD5 existing and new messages file
MD5_OLD=$(md5sum i18n/messages.xlf | cut -c -32)
MD5_NEW=$(md5sum i18n/messages.new.xlf | cut -c -32)

if [ $MD5_OLD != $MD5_NEW ] ; then
  mv i18n/messages.new.xlf i18n/messages.xlf
  aio/scripts/xliffmerge.sh
  echo "i18n/messages.* files are updated. Commit them too."
  git add i18n
fi

# Remove extracted file for check
rm -fr i18n/messages.new.xlf
