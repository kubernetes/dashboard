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

FROM golang:1.22-alpine3.19 as builder

ARG TARGETARCH
ARG TARGETOS
ARG VERSION

ENV USER=nonroot
ENV UID=10001

# Create nonroot user.
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

WORKDIR /workspace

# Copy required local modules
COPY /common/certificates /workspace/common/certificates

WORKDIR /workspace/api

# Retrieve application dependencies.
# This allows the container build to reuse cached dependencies.
# Expecting to copy go.mod and if present go.sum.
COPY api/go.* ./
RUN go mod download

COPY api/pkg ./pkg
COPY api/main.go ./

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w -X k8s.io/dashboard/api/client.Version=${VERSION}" -o dashboard-api .

# Scratch can be used as the base image because the binary is compiled to include all dependencies.
FROM scratch as final

# Add all files from current working directory to the root of the image, i.e., copy dist directory
# layout to the root directory.
COPY --from=builder /workspace/api/dashboard-api /dashboard-api

# Import the user and group files from the builder.
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

USER nonroot:nonroot

# The port that the application listens on.
EXPOSE 9000 9001
ENTRYPOINT ["/dashboard-api", "--insecure-bind-address=0.0.0.0", "--bind-address=0.0.0.0"]
