#!/usr/bin/env bash

# Copyright 2019 The Kubernetes Authors.
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

TMP_DIR="${TMP_DIR:-$(mktemp -d /tmp/update-vendor.XXXX)}"

echo "vendor: running 'go mod tidy'"
go mod tidy -v

echo "vendor: running 'go mod vendor'"
go mod vendor

# sort recorded packages for a given vendored dependency in modules.txt.
# `go mod vendor` outputs in imported order, which means slight go changes (or different platforms) can result in a differently ordered modules.txt.
# scan                 | prefix comment lines with the module name       | sort field 1  | strip leading text on comment lines
awk '{if($1=="#") print $2 " " $0; else print}' < vendor/modules.txt | sort -k1,1 -s | sed 's/.*#/#/' > "${TMP_DIR}/modules.txt.tmp"
mv "${TMP_DIR}/modules.txt.tmp" vendor/modules.txt

echo "Vendor Updated"