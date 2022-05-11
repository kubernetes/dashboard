API_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
ROOT_DIRECTORY = $(API_DIRECTORY)/../..
DIST_DIRECTORY = $(ROOT_DIRECTORY)/.dist
SERVE_DIRECTORY = $(DIST_DIRECTORY)/api
SERVE_BINARY = $(DIST_DIRECTORY)/api/dashboard-api
MAIN_PACKAGE = k8s.io/dashboard/api
VERSION = v2.5.1

# API Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
SIDECAR_HOST ?= http://localhost:7000
TOKEN_TTL ?= 3600 # 1 hour
AUTO_GENERATE_CERTS ?= false
BIND_ADDRESS ?= 127.0.0.1
PORT ?= 8080
ENABLE_INSECURE_LOGIN ?= false
ENABLE_SKIP_LOGIN ?= false

.PHONY: build
build:
	@CGO_ENABLED=0 go build -ldflags "-X $(MAIN_PACKAGE)/client.Version=$(VERSION)" -gcflags="all=-N -l" -o $(SERVE_BINARY) $(MAIN_PACKAGE)

.PHONY: run
run: build
	@$(SERVE_BINARY) --kubeconfig=$(KUBECONFIG) \
		--sidecar-host=$(SIDECAR_HOST) \
		--token-ttl=$(TOKEN_TTL) \
		--auto-generate-certificates=$(AUTO_GENERATE_CERTS) \
		--enable-insecure-login=$(ENABLE_INSECURE_LOGIN) \
		--enable-skip-login=$(ENABLE_SKIP_LOGIN)

.PHONY: serve
serve:
	@air

.PHONY: serve-https
serve-https:
	AUTO_GENERATE_CERTS=true $(MAKE) serve
