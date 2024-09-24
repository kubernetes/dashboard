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

ARG WEB_BUILDER_ARCH=amd64

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

FROM --platform=linux/${WEB_BUILDER_ARCH} node:20.11.1-alpine3.19  as web-builder

RUN apk add --no-cache \
    make \
    perl

WORKDIR /workspace

# Copy Makefile partials
COPY /hack/include /workspace/hack/include

# Copy all files from web except node_modules and .angular
COPY /modules/web /workspace/modules/web

WORKDIR /workspace/modules/web

# Setup yarn and install web dependencies
RUN yarn set version 3.3.0
RUN yarn plugin import workspace-tools
RUN SKIP_POSTINSTALL=true yarn workspaces focus

# Build prod version of web app
RUN make build-frontend

FROM golang:1.23-alpine3.19 as go-builder

ARG TARGETARCH
ARG TARGETOS
ARG VERSION

WORKDIR /workspace

# Copy required local modules
COPY /modules/common/certificates /workspace/common/certificates
COPY /modules/common/errors /workspace/common/errors
COPY /modules/common/helpers /workspace/common/helpers
COPY /modules/common/client /workspace/common/client
COPY /modules/common/types /workspace/common/types

WORKDIR /workspace/web

# Retrieve application dependencies.
# This allows the container build to reuse cached dependencies.
# Expecting to copy go.mod and if present go.sum.
COPY /modules/web/go.* ./
RUN go mod download

COPY /modules/web/pkg ./pkg
COPY /modules/web/main.go ./

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w -X k8s.io/dashboard/web/pkg/environment.Version=${VERSION}" -o dashboard-web .

# Scratch can be used as the base image because the binary is compiled to include all dependencies.
FROM scratch as final

WORKDIR /web

# By default dashboard-web will look for locale_conf.json in the same directory as binary
COPY --from=web-builder /workspace/modules/web/.dist/public/locale_conf.json /locale_conf.json
COPY --from=web-builder /workspace/modules/web/.dist/public /public
COPY --from=go-builder /workspace/web/dashboard-web /dashboard-web

# Import the user and group files from the builder.
COPY --from=user /etc/passwd /etc/passwd
COPY --from=user /etc/group /etc/group

USER nonroot:nonroot

# The port that the application listens on.
EXPOSE 8000 8001
ENTRYPOINT ["/dashboard-web", "--insecure-bind-address=0.0.0.0", "--bind-address=0.0.0.0"]
