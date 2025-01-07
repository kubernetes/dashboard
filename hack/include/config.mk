### Common application/container details
PROJECT_NAME := dashboard

### Dirs and paths
# Base paths
PARTIALS_DIRECTORY := $(ROOT_DIRECTORY)/hack/include
# Modules
MODULES_DIRECTORY := $(ROOT_DIRECTORY)/modules
API_DIRECTORY := $(MODULES_DIRECTORY)/api
AUTH_DIRECTORY := $(MODULES_DIRECTORY)/auth
METRICS_SCRAPER_DIRECTORY := $(MODULES_DIRECTORY)/metrics-scraper
WEB_DIRECTORY := $(MODULES_DIRECTORY)/web
TOOLS_DIRECTORY := $(MODULES_DIRECTORY)/common/tools
# Gateway
GATEWAY_DIRECTORY := $(ROOT_DIRECTORY)/hack/gateway
# Docker files
DOCKER_DIRECTORY := $(ROOT_DIRECTORY)/hack/docker
DOCKER_COMPOSE_PATH := $(DOCKER_DIRECTORY)/docker.compose.yaml
DOCKER_COMPOSE_DEV_PATH := $(DOCKER_DIRECTORY)/dev.compose.yml
# Build
TMP_DIRECTORY := $(ROOT_DIRECTORY)/.tmp
# Kind
KIND_CLUSTER_NAME := kubernetes-dashboard
KIND_CLUSTER_VERSION := 1.32.0
KIND_CLUSTER_IMAGE := docker.io/kindest/node:v${KIND_CLUSTER_VERSION}
KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH := $(TMP_DIRECTORY)/kubeconfig
KIND_CLUSTER_KUBECONFIG_CONTEXT := kind-$(KIND_CLUSTER_NAME)
KIND_CONFIG_FILE := $(PARTIALS_DIRECTORY)/kind.config.yml
# Metrics server
METRICS_SERVER_VERSION := v0.7.0
# Ingress nginx (kind)
INGRESS_NGINX_VERSION := v1.10.0
# Tools
GOLANGCI_LINT_CONFIG := $(ROOT_DIRECTORY)/.golangci.yml
# Chart
CHART_DIRECTORY := $(ROOT_DIRECTORY)/charts/kubernetes-dashboard

### GOPATH check
ifndef GOPATH
$(warning $$GOPATH environment variable not set)
endif

ifeq (,$(findstring $(GOPATH)/bin,$(PATH)))
$(warning $$GOPATH/bin directory is not in your $$PATH)
endif
