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

# Accept the Go version for the image to be set as a build argument.
ARG GO_VERSION=1.19.8

# First stage: build the executable.
FROM --platform=$BUILDPLATFORM golang:${GO_VERSION}-buster AS builder

# Expose global args
ARG TARGETARCH
ARG TARGETOS

# What arch is it?
ARG GOARCH=$TARGETARCH
ARG GOOS=$TARGETOS

# Install the Certificate-Authority certificates for the app to be able to make
# calls to HTTPS endpoints.
RUN apt-get update && \
    apt-get install -y ca-certificates git gcc libc-dev libncurses5-dev sqlite3

# Set the working directory outside $GOPATH to enable the support for modules.
WORKDIR /src

# Import the code from the context.
COPY ../../../../Desktop/dashboard-metrics-scraper-master ./

# Build the executable to `/app`. Mark the build as statically linked.
RUN echo "Building for $GOARCH" \
    && mkdir -p ${GOPATH}/src/github.com/kubernetes-sigs \
    && ln -sf `pwd` ${GOPATH}/src/github.com/kubernetes-sigs/dashboard-metrics-scraper \
    && GOARCH=${GOARCH} hack/build.sh

# Create a nonroot user for final image
RUN useradd -u 10001 nonroot

# Final stage: the running container.
FROM scratch AS final

# Import the compiled executable from the second stage.
COPY --from=builder /metrics-sidecar /metrics-sidecar

# Copy nonroot user
COPY --from=builder /etc/passwd /etc/passwd

# Declare the port on which the webserver will be exposed.
EXPOSE 8080
USER nonroot

# Run the compiled binary.
ENTRYPOINT ["/metrics-sidecar"]
