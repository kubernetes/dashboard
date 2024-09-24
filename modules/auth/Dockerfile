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
COPY /common/client /workspace/common/client
COPY /common/csrf /workspace/common/csrf
COPY /common/errors /workspace/common/errors
COPY /common/helpers /workspace/common/helpers
COPY /common/types /workspace/common/types

WORKDIR /workspace/auth

# Retrieve application dependencies.
# This allows the container build to reuse cached dependencies.
# Expecting to copy go.mod and if present go.sum.
COPY auth/go.* ./
RUN go mod download

COPY auth/api ./api
COPY auth/pkg ./pkg
COPY auth/main.go ./

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w -X k8s.io/dashboard/auth/pkg/environment.Version=${VERSION}" -o dashboard-auth .

# Scratch can be used as the base image because the backend is compiled to include all
# its dependencies.
FROM scratch as final
ARG TARGETARCH
ARG TARGETOS

# Add all files from current working directory to the root of the image, i.e., copy dist directory
# layout to the root directory.
COPY --from=builder /workspace/auth/dashboard-auth /dashboard-auth

# Import the user and group files from the builder.
COPY --from=user /etc/passwd /etc/passwd
COPY --from=user /etc/group /etc/group

USER nonroot:nonroot

# The port that the application listens on.
EXPOSE 8000
ENTRYPOINT ["/dashboard-auth"]
