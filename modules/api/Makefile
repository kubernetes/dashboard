# Paths and directories
API_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
ROOT_DIRECTORY = $(API_DIRECTORY)/../..
DIST_DIRECTORY = $(ROOT_DIRECTORY)/.dist
SERVE_DIRECTORY = $(DIST_DIRECTORY)/api
SERVE_BINARY = $(SERVE_DIRECTORY)/$(APP_NAME)
MAIN_PACKAGE = k8s.io/dashboard/api

# Codegen configuration
BASE_DIR = $(API_DIRECTORY)/pkg/plugin
INPUT_BASE = $(MAIN_PACKAGE)/pkg/plugin
INPUT = "apis/v1alpha1"
CLIENTSET_NAME = clientset
OUTPUT_BASE = $(BASE_DIR)
OUTPUT_PACKAGE = $(INPUT_BASE)/client
VERIFY_ONLY = false
CODEGEN_EXTRA_ARGS = ""

# Container deployment configuration
REGISTRY = kubernetesui
APP_NAME = dashboard-api
IMAGE = $(REGISTRY)/$(APP_NAME)

RELEASE_VERSION = v1.0.0
RELEASE_IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):$(RELEASE_VERSION))

DEV_VERSION = latest
DEV_IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):$(DEV_VERSION))

# Build configuration
ARCHITECTURES = amd64 arm64 arm ppc64le s390x

# BUILDARCH is the host machine architecture
BUILDARCH ?= $(shell uname -m)

# BUILDOS is the host machine OS
BUILDOS ?= $(shell uname -s)

ifeq ($(BUILDARCH),x86_64)
	BUILDARCH=amd64
endif
ifeq ($(BUILDARCH),aarch64)
	BUILDARCH=arm64
endif
ifeq ($(BUILDARCH),armv7l)
	BUILDARCH=armv7
endif

ifeq ($(BUILDOS),Linux)
	BUILDOS=linux
endif
ifeq ($(BUILOS),Darwin)
	BUILDOS=darwin
endif

# ARCH is the target build architecture. Unless overridden during build, host architecture (BUILDARCH) will be used
ARCH ?= $(BUILDARCH)
# OS is the target build OS. Unless overridden during build, host OS (BUILDOS) will be used
OS ?= $(BUILDOS)

# API Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
SIDECAR_HOST ?= http://localhost:7000
TOKEN_TTL ?= 3600 # 1 hour
AUTO_GENERATE_CERTS ?= false
BIND_ADDRESS ?= 127.0.0.1
PORT ?= 8080
ENABLE_INSECURE_LOGIN ?= false
ENABLE_SKIP_LOGIN ?= false

# List of targets that should be executed before other targets
PRE := --ensure-dist-exists

.PHONY: codegen-update
codegen-update: --codegen-update-run --codegen-update-post

.PHONY: codegen-verify
codegen-verify: VERIFY_ONLY = true
codegen-verify: --codegen-verify-pre --codegen-update-run --codegen-verify-post

.PHONY: build
build: ARCHITECTURES = $(ARCH)
build: $(PRE) build-cross

.PHONY: build-cross
build-cross:
	@for ARCH in $(ARCHITECTURES) ; do \
  	echo "Building dashboard-api for $(OS)/$$ARCH" ; \
  	CGO_ENABLED=0 GOOS=$(OS) GOARCH=$$ARCH go build -ldflags "-X $(MAIN_PACKAGE)/client.Version=$(RELEASE_VERSION)" -gcflags="all=-N -l" -o $(DIST_DIRECTORY)/api/$$ARCH/dashboard-api $(MAIN_PACKAGE) ; \
  done

.PHONY: run
run: build
	@$(SERVE_BINARY) --kubeconfig=$(KUBECONFIG) \
		--sidecar-host=$(SIDECAR_HOST) \
		--token-ttl=$(TOKEN_TTL) \
		--auto-generate-certificates=$(AUTO_GENERATE_CERTS) \
		--enable-insecure-login=$(ENABLE_INSECURE_LOGIN) \
		--enable-skip-login=$(ENABLE_SKIP_LOGIN)

.PHONY: serve
serve: $(PRE)
	@air

.PHONY: serve-https
serve-https:
	AUTO_GENERATE_CERTS=true $(MAKE) serve

.PHONY: deploy
deploy: --docker-buildx
	docker manifest create --amend $(IMAGE):$(RELEASE_VERSION) $(RELEASE_IMAGE_NAMES) ; \
  docker manifest create --amend $(IMAGE):$(DEV_VERSION) $(DEV_IMAGE_NAMES) ; \
  docker manifest push $(IMAGE):$(RELEASE_VERSION) ; \
  docker manifest push $(IMAGE):$(DEV_VERSION)

.PHONY: --docker-buildx
--docker-buildx: build-cross
	@for ARCH in $(ARCHITECTURES) ; do \
		docker buildx build \
			-t $(IMAGE)-$$ARCH:$(RELEASE_VERSION) \
			-t $(IMAGE)-$$ARCH:$(DEV_VERSION) \
			--platform linux/$$ARCH \
			--push \
			$(SERVE_DIRECTORY)/$$ARCH ; \
	done ; \

.PHONY: --ensure-dist-exists
--ensure-dist-exists:
	@mkdir -p $(SERVE_DIRECTORY)

.PHONY: --codegen-update-run
--codegen-update-run:
	@${GOPATH}/bin/client-gen \
  	--input-base=$(INPUT_BASE) \
  	--input=$(INPUT) \
  	--clientset-name=$(CLIENTSET_NAME) \
  	--output-base=$(OUTPUT_BASE) \
  	--output-package=$(OUTPUT_PACKAGE) \
  	--verify-only=$(VERIFY_ONLY) \
  	$(CODEGEN_EXTRA_ARGS)

.PHONY: --codegen-update-post
--codegen-update-post:
	@rm -rf $(BASE_DIR)/client
	@mv $(BASE_DIR)/$(OUTPUT_PACKAGE) $(BASE_DIR)
	@rm -rf $(BASE_DIR)/k8s.io

.PHONY: --codegen-verify-pre
--codegen-verify-pre:
	@mkdir -p $(BASE_DIR)/$(OUTPUT_PACKAGE)
	@cp -r $(BASE_DIR)/client $(BASE_DIR)/$(INPUT_BASE)

.PHONY: --codegen-verify-post
--codegen-verify-post:
	@rm -rf $(BASE_DIR)/k8s.io
