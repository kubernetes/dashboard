### Common application/container details
PROJECT_NAME := dashboard
# Supported architectures
ARCHITECTURES := amd64 arm64 arm ppc64le s390x
BUILDX_ARCHITECTURES := linux/amd64,linux/arm64,linux/arm,linux/ppc64le,linux/s390x,darwin/amd64,darwin/arm64
# Container registry details
IMAGE_REGISTRIES := docker.io
IMAGE_REPOSITORY := kubernetesui

### Dirs and paths
# Base paths
PARTIALS_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
# Modules
MODULES_DIRECTORY := $(ROOT_DIRECTORY)/modules
API_DIRECTORY := $(MODULES_DIRECTORY)/api
WEB_DIRECTORY := $(MODULES_DIRECTORY)/web
TOOLS_DIRECTORY := $(MODULES_DIRECTORY)/common/tools
# Gateway
GATEWAY_DIRECTORY := $(ROOT_DIRECTORY)/hack/gateway
# Docker files
DOCKER_DIRECTORY := $(ROOT_DIRECTORY)/hack/docker
DOCKER_COMPOSE_PATH := $(DOCKER_DIRECTORY)/docker.compose.yaml
# Build
DIST_DIRECTORY := $(ROOT_DIRECTORY)/.dist

### GOPATH check
ifndef GOPATH
$(error $$GOPATH environment variable not set)
endif

ifeq (,$(findstring $(GOPATH)/bin,$(PATH)))
$(error $$GOPATH/bin directory is not in your $$PATH)
endif
