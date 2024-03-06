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
FROM golang:1.20-bullseye

# Install Node.js. Go is already installed.
# A small tweak, apt-get update is already run by the nodejs setup script,
# so there's no need to run it again.
RUN apt-get update && apt-get install -y ca-certificates --no-install-recommends curl gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | \
  gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ENV NODE_MAJOR=18
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | \
  tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y --no-install-recommends \
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

# Install yarn
RUN npm install -g yarn

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

# Suppress angular analytics dialog
ENV NG_CLI_ANALYTICS=false

# Download a statically linked docker client,
# so the container is able to build images on the host.
RUN curl -sSL https://download.docker.com/linux/static/stable/x86_64/docker-23.0.1.tgz > /tmp/docker.tgz && \
	cd /tmp/ && \
	tar xzvf docker.tgz && \
	rm docker.tgz && \
	mv /tmp/docker/docker /usr/bin/docker && \
	rm -rf /tmp/docker/ && \
	chmod +x /usr/bin/docker

# Install docker compose plugin
RUN mkdir -p /usr/local/lib/docker/cli-plugins
RUN curl -SL https://github.com/docker/compose/releases/download/v2.14.0/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
RUN chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Install kubectl
RUN curl -LO https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
RUN chmod +x ./kubectl
RUN mv ./kubectl /usr/local/bin/kubectl

# Install golangci for ckecking or fixing go format.
# `npm ci` installs golangci, but this installation is needed
# for running `npm run check` singlely, like
# `hack/develop/run-dev-container.sh run check`.
RUN curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | \
  sh -s -- -b $(go env GOPATH)/bin v1.52.2

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

# Run gosu command in container.
CMD ./hack/develop/gosu-command.sh
