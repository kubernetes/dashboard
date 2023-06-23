#!/bin/bash
# Copyright 2017 The Kubernetes Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


arch_list=(amd64 arm arm64 ppc64le s390x)
manifest="kubernetesui/metrics-scraper";

# Concat arch_list with ,
platforms=$(IFS=,; echo "${arch_list[*]}")

image_name="${manifest}:${TRAVIS_TAG:="latest"}"

echo "--- docker buildx build --push --platform $platforms --tag $image_name .";
docker buildx build --push --platform ${platforms} --tag ${image_name} .
