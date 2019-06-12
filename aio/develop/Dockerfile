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

# This is a Dockerfile for running and building Kubernetes dashboard
# It installs all deps in the container and adds the dashboard source
# This way it abstracts all required build tools away and lets the user
# run gulp tasks on the code with only docker installed

# golang is based on debian:jessie
FROM golang

# Install Node.js. Go is already installed.
# A small tweak, apt-get update is already run by the nodejs setup script,
# so there's no need to run it again.
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash - \
  && apt-get install -y --no-install-recommends \
	openjdk-8-jre \
	nodejs \
	patch \
	chromium \
	bc \
	&& rm -rf /var/lib/apt/lists/* \
	&& apt-get clean

# Install dependencies. This will take a while.
RUN npm install -g npm@latest gulp

# Set environment variable for JavaScript tests.
ENV CHROME_BIN=/usr/bin/chromium

# Set environment variable for terminal
ENV TERM=xterm

# Add ${GOPATH}/bin into ${PATH}
ENV PATH=${GOPATH}/bin:${PATH}

# For testing, etc., to know if this environment is on container.
ENV K8S_DASHBOARD_CONTAINER=TRUE

# Suppress angular analytics dialog
ENV NG_CLI_ANALYTICS=false

# Download a statically linked docker client,
# so the container is able to build images on the host.
RUN curl -sSL https://download.docker.com/linux/static/stable/x86_64/docker-18.06.1-ce.tgz > /tmp/docker.tgz && \
	cd /tmp/ && \
	tar xzvf docker.tgz && \
	rm docker.tgz && \
	mv /tmp/docker/docker /usr/bin/docker && \
	rm -rf /tmp/docker/ && \
	chmod +x /usr/bin/docker

# Install golangci for ckecking or fixing go format.
# `npm ci` installs golangci, but this installation is needed
# for running `npm run check` singlely, like
# `aio/develop/run-npm-on-container.sh run check`.
RUN go get github.com/golangci/golangci-lint/cmd/golangci-lint

# Install delve for debuging go files.
RUN go get github.com/go-delve/delve/cmd/dlv

# Volume for source code
VOLUME ["/go/src/github.com/kubernetes/dashboard"]

# Mount point for kubeconfig
RUN mkdir -p /root/.kube

# Current directory is always dashboard source directory.
WORKDIR /go/src/github.com/kubernetes/dashboard

# Expose port for frontend, backend and remote debuging
EXPOSE 8080 9090 2345

# Run npm command in container. 
CMD ./aio/develop/npm-command.sh
