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


if [[ "$GOARCH" = "arm" ]]; then

echo "Detected ARM. Setting additional variables.";

apt-get install -y libc6-armel-cross libc6-dev-armel-cross binutils-arm-linux-gnueabi gcc-arm-linux-gnueabihf

env CC=arm-linux-gnueabihf-gcc CXX=arm-linux-gnueabihf-g++ \
CGO_ENABLED=1 GOOS=linux GOARM=7 \
go build \
-tags netgo \
-installsuffix 'static,netgo' \
-ldflags '-extldflags "-static"' \
-o /metrics-sidecar k8s.io/dashboard/metrics-scraper

elif [[ "$GOARCH" = "arm64" ]]; then

echo "Detected ARM64. Setting additional variables.";

apt-get install -y gcc-aarch64-linux-gnu

env CC=aarch64-linux-gnu-gcc \
CGO_ENABLED=1 GOOS=linux \
go build \
-tags netgo \
-installsuffix 'static,netgo' \
-ldflags '-extldflags "-static"' \
-o /metrics-sidecar k8s.io/dashboard/metrics-scraper

elif [[ "$GOARCH" = "ppc64le" ]]; then

echo "Detected ppc64le. Setting additional variables.";

apt-get install -y gcc-powerpc64le-linux-gnu

env CC=powerpc64le-linux-gnu-gcc \
CGO_ENABLED=1 GOOS=linux \
go build \
-tags netgo \
-installsuffix 'static,netgo' \
-ldflags '-extldflags "-static"' \
-o /metrics-sidecar k8s.io/dashboard/metrics-scraper

elif [[ "$GOARCH" = "s390x" ]]; then

echo "Detected s390x. Setting additional variables.";

apt-get install -y gcc-s390x-linux-gnu

env CC=s390x-linux-gnu-gcc \
CGO_ENABLED=1 GOOS=linux \
go build \
-tags netgo \
-installsuffix 'static,netgo' \
-ldflags '-extldflags "-static"' \
-o /metrics-sidecar k8s.io/dashboard/metrics-scraper
else

echo "Build script building for ${GOARCH}";

go build \
-tags netgo \
-installsuffix 'static,netgo' \
-ldflags '-extldflags "-static"' \
-o /metrics-sidecar k8s.io/dashboard/metrics-scraper

fi
