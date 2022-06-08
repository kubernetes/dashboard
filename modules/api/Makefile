API_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
ROOT_DIRECTORY = $(API_DIRECTORY)/../..
DIST_DIRECTORY = $(ROOT_DIRECTORY)/.dist
SERVE_DIRECTORY = $(DIST_DIRECTORY)/api
SERVE_BINARY = $(DIST_DIRECTORY)/api/dashboard-api
COVERAGE_FILE = $(API_DIRECTORY)/coverage.out
MAIN_PACKAGE = k8s.io/dashboard/api
VERSION = v1.0.0

RELEASE_IMAGE = kubernetesui/dashboard-api
RELEASE_IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):$(RELEASE_VERSION))
RELEASE_IMAGE_NAMES_LATEST += $(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):latest)

########################################################################################################
ARCHITECTURES = amd64 arm64 arm ppc64le s390x

# BUILDARCH is the host machine architecture
BUILDARCH ?= $(shell uname -m)

ifeq ($(BUILDARCH),x86_64)
	BUILDARCH=amd64
endif
ifeq ($(BUILDARCH),aarch64)
	BUILDARCH=arm64
endif
ifeq ($(BUILDARCH),armv7l)
	BUILDARCH=armv7
endif

# ARCH is the target build architecture. Unless overridden during build, host architecture (BUILDARCH) will be used
ARCH ?= $(BUILDARCH)

########################################################################################################

# API Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
SIDECAR_HOST ?= http://localhost:7000
TOKEN_TTL ?= 3600 # 1 hour
AUTO_GENERATE_CERTS ?= false
BIND_ADDRESS ?= 127.0.0.1
PORT ?= 8080
ENABLE_INSECURE_LOGIN ?= false
ENABLE_SKIP_LOGIN ?= false

PRE := --ensure-dir-exists

.PHONY: build
build: ARCHITECTURES = $(ARCH)
build: $(PRE) build-cross

.PHONY: build-cross
build-cross:
	@for ARCH in $(ARCHITECTURES) ; do \
  	echo "Building dashboard-api for $$ARCH" ; \
  	CGO_ENABLED=0 GOOS=linux GOARCH=$$ARCH go build -ldflags "-X $(MAIN_PACKAGE)/client.Version=$(VERSION)" -gcflags="all=-N -l" -o $(DIST_DIRECTORY)/api/$$ARCH/dashboard-api $(MAIN_PACKAGE) ; \
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

.PHONY: test
test:
	go test $(MAIN_PACKAGE)/...

.PHONY: coverage
coverage:
	go test -coverprofile=$(GO_COVERAGE_FILE) -covermode=atomic $(MAIN_PACKAGE)/...

.PHONY: deploy
deploy: --docker-buildx
	docker manifest create --amend $(RELEASE_IMAGE):$(VERSION) $(RELEASE_IMAGE_NAMES) ; \
  docker manifest create --amend $(RELEASE_IMAGE):latest $(RELEASE_IMAGE_NAMES_LATEST) ; \
  docker manifest push $(RELEASE_IMAGE):$(VERSION) ; \
  docker manifest push $(RELEASE_IMAGE):latest

.PHONY: --docker-buildx
--docker-buildx: build-cross
	@for ARCH in $(ARCHITECTURES) ; do \
		docker buildx build \
			-t $(RELEASE_IMAGE)-$$ARCH:$(VERSION) \
			-t $(RELEASE_IMAGE)-$$ARCH:latest \
			--build-arg BUILDPLATFORM=linux/$$ARCH \
			--platform linux/$$ARCH \
			--push \
			$(SERVE_DIRECTORY)/$$ARCH ; \
	done ; \

.PHONY: --ensure-dir-exists
--ensure-dir-exists:
	@mkdir -p $(SERVE_DIRECTORY)
