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

# This is a Dockerfile for running and building Kubernetes dashboard
# It installs all deps in the container and adds the dashboard source
# This way it abstracts all required build tools away

# golang is based on debian:jessie
# Specify version to clarify which version we use.
FROM golang:1.17.0-bullseye

# Install Node.js. Go is already installed.
# A small tweak, apt-get update is already run by the nodejs setup script,
# so there's no need to run it again.
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
	&& apt-get install -y --no-install-recommends \
	nodejs \
	patch \
	chromium \
	bc \
	sudo \
	git \
	gosu \
	nano \
	less \
	xvfb \
	libgtk-3-0 \
	libgconf-2-4 \
	bzip2 \
	&& rm -rf /var/lib/apt/lists/* \
	&& apt-get clean

ENV GIT_EDITOR=nano

# Install firefox from Mozilla binaries
RUN mkdir -p /usr/local/lib/firefox
RUN wget "https://download.mozilla.org/?product=firefox-latest-ssl&os=linux64&lang=en-US" -O /tmp/firefox.tar.bz2
RUN tar -xjf /tmp/firefox.tar.bz2 -C /usr/local/lib
RUN ln -s /usr/local/lib/firefox/firefox /usr/local/bin/firefox

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

# Install kubectl
RUN curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin/kubectl

# Install golangci for ckecking or fixing go format.
# `npm ci` installs golangci, but this installation is needed
# for running `npm run check` singlely, like
# `aio/develop/run-npm-on-container.sh run check`.
RUN curl -sfL https://install.goreleaser.com/github.com/golangci/golangci-lint.sh | sh -s -- -b $(go env GOPATH)/bin v1.41.1

# Enable go mod.
ENV GO111MODULE=on

# Install delve for debuging go files.
RUN go install github.com/go-delve/delve/cmd/dlv@v1.7.1

# Set GOPROXY to ensure download modules
ENV GOPROXY=https://proxy.golang.org

# Set NODE_OPTIONS to increase NodeJS heap size
ENV NODE_OPTIONS=--max-old-space-size=8192

# To install go modules by user, add write access to $GOPATH (default: 755)
# `chmod +w` does not work, so set 777.
RUN chmod 777 -R /go

# Volume for source code
VOLUME ["/go/src/github.com/kubernetes/dashboard"]

# Mount point for kubeconfig
RUN mkdir -p /home/user/.kube

# Current directory is always dashboard source directory.
WORKDIR /go/src/github.com/kubernetes/dashboard

# Expose port for frontend, backend and remote debuging
EXPOSE 8080 8443 9090 2345

# Run gosu command in container.
CMD ./aio/develop/gosu-command.sh
