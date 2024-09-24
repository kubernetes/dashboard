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

FROM alpine:3.19 as user

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

FROM golang:1.23-alpine3.19 as builder

ARG TARGETARCH
ARG TARGETOS
ARG VERSION

WORKDIR /workspace

# Copy required local modules
COPY /common/certificates /workspace/common/certificates
COPY /common/client /workspace/common/client
COPY /common/csrf /workspace/common/csrf
COPY /common/errors /workspace/common/errors
COPY /common/types /workspace/common/types
COPY /common/helpers /workspace/common/helpers

WORKDIR /workspace/api

# Retrieve application dependencies.
# This allows the container build to reuse cached dependencies.
# Expecting to copy go.mod and if present go.sum.
COPY api/go.* ./
RUN go mod download

COPY api/pkg ./pkg
COPY api/main.go ./

RUN echo ${VERSION}
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w -X k8s.io/dashboard/api/pkg/environment.Version=${VERSION}" -o dashboard-api .

# Scratch can be used as the base image because the binary is compiled to include all dependencies.
FROM scratch as final

COPY --from=builder /workspace/api/dashboard-api /dashboard-api

# Import the user and group files from the builder.
COPY --from=user /etc/passwd /etc/passwd
COPY --from=user /etc/group /etc/group

USER nonroot:nonroot

# The port that the application listens on.
EXPOSE 8000 8001
ENTRYPOINT ["/dashboard-api", "--insecure-bind-address=0.0.0.0", "--bind-address=0.0.0.0"]
