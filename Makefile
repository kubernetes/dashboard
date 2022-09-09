ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include $(API_DIRECTORY)/hack/include/config.mk
include $(WEB_DIRECTORY)/hack/include/config.mk

# Unused
#SHELL = /bin/bash
#GOOS ?= $(shell go env GOOS)
#GOARCH ?= $(shell go env GOARCH)
#GOPATH ?= $(shell go env GOPATH)
#CODEGEN_VERSION := v0.23.6
#CODEGEN_BIN := $(GOPATH)/pkg/mod/k8s.io/code-generator@$(CODEGEN_VERSION)/generate-groups.sh
#GO_COVERAGE_FILE = $(ROOT_DIRECTORY)/coverage/go.txt
#COVERAGE_DIRECTORY = $(ROOT_DIRECTORY)/coverage
#MAIN_PACKAGE = github.com/kubernetes/dashboard/src/app/backend

MAKEFLAGS += -j2

# List of targets that should be executed before other targets
PRE = --ensure-tools

.PHONY: check-license
check-license: $(PRE)
	@${GOPATH}/bin/license-eye header check

.PHONY: fix-license
fix-license: $(PRE)
	@${GOPATH}/bin/license-eye header fix

# Starts development version of the application.
#
# URL: http://localhost:8080
#
# Note: Make sure that the port 8080 is free on your localhost
.PHONY: serve
serve: $(PRE)
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=serve

# Starts development version of the application with HTTPS enabled.
#
# URL: https://localhost:8080
#
# Note: Make sure that the port 8080 is free on your localhost
# Note #2: Does not work with "kind".
.PHONY: serve-https
serve-https: $(PRE)
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=serve-https

# Starts a prod version of the application.
#
# URL: https://localhost:4443
#
# Note: Make sure that the ports 4443 (Gateway) and 9001 (API) are free on your localhost
# Note #2: Does not work with "kind".
.PHONY: run
run: $(PRE) --ensure-compose-down --compose
	@KUBECONFIG=$(KUBECONFIG) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	ENABLE_SKIP_LOGIN=$(ENABLE_SKIP_LOGIN) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	TOKEN_TTL=$(TOKEN_TTL) \
	ARCH=$(ARCH) \
	OS=$(OS) \
	docker compose -f $(DOCKER_COMPOSE_PATH) --project-name=$(PROJECT_NAME) up

.PHONY: build
build: TARGET := build
build: build-cross

.PHONY: build-cross
build-cross:
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=$(or $(TARGET),build-cross)

.PHONY: --compose
--compose: --ensure-certificates
	@KUBECONFIG=$(KUBECONFIG) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	ENABLE_SKIP_LOGIN=$(ENABLE_SKIP_LOGIN) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	TOKEN_TTL=$(TOKEN_TTL) \
	ARCH=$(ARCH) \
	OS=$(OS) \
	docker compose -f $(DOCKER_COMPOSE_PATH) --project-name=$(PROJECT_NAME) build

.PHONY: --ensure-tools
--ensure-tools:
	@$(MAKE) --no-print-directory -C $(TOOLS_DIRECTORY) install

.PHONY: --ensure-compose-down
--ensure-compose-down:
	@KUBECONFIG=$(KUBECONFIG) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	ENABLE_SKIP_LOGIN=$(ENABLE_SKIP_LOGIN) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	TOKEN_TTL=$(TOKEN_TTL) \
	ARCH=$(ARCH) \
	OS=$(OS) \
	docker compose -f $(DOCKER_COMPOSE_PATH) --project-name=$(PROJECT_NAME) down

.PHONY: --ensure-certificates
--ensure-certificates:
	@$(MAKE) --no-print-directory -C $(GATEWAY_DIRECTORY) generate-certificates

#.PHONY: ensure-codegen
#ensure-codegen: ensure-go
#	go get -d k8s.io/code-generator@$(CODEGEN_VERSION)
#	go mod tidy
#	chmod +x $(CODEGEN_BIN)
#
#.PHONY: build-cross
#build-cross: clean ensure-go
#	./aio/scripts/build.sh -c
#
#.PHONY: prod-backend
#prod-backend: clean ensure-go
#	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags "-X $(MAIN_PACKAGE)/client.Version=$(RELEASE_VERSION)" -o $(PROD_BINARY) $(MAIN_PACKAGE)
#
#.PHONY: prod-backend-cross
#prod-backend-cross: clean ensure-go
#	for ARCH in $(ARCHITECTURES) ; do \
#  	CGO_ENABLED=0 GOOS=linux GOARCH=$$ARCH go build -a -installsuffix cgo -ldflags "-X $(MAIN_PACKAGE)/client.Version=$(RELEASE_VERSION)" -o dist/$$ARCH/dashboard $(MAIN_PACKAGE) ; \
#  done
#
#.PHONY: prod
#prod: build
#	$(PROD_BINARY) --kubeconfig=$(KUBECONFIG) \
#		--sidecar-host=$(API_SIDECAR_HOST) \
#		--auto-generate-certificates \
#		--locale-config=dist/amd64/locale_conf.json \
#		--bind-address=${BIND_ADDRESS} \
#		--port=${PORT}
#
#.PHONY: check-codegen
#check-codegen: ensure-codegen
#	./aio/scripts/verify-codegen.sh
#
#.PHONY: fix-codegen
#fix-codegen: ensure-codegen
#	./aio/scripts/update-codegen.sh
#
#.PHONY: check-go
#check-go: ensure-golangcilint
#	golangci-lint run -c .golangci.yml ./src/app/backend/...
#
#.PHONY: fix-go
#fix-go: ensure-golangcilint
#	golangci-lint run -c .golangci.yml --fix ./src/app/backend/...
#
#.PHONY: start-cluster
#start-cluster:
#	./aio/scripts/start-cluster.sh
#
#.PHONY: stop-cluster
#stop-cluster:
#	./aio/scripts/stop-cluster.sh
#
#.PHONY: e2e
#e2e: start-cluster
#	npm run e2e
#	make stop-cluster
#
#.PHONY: e2e-headed
#e2e-headed: start-cluster
#	npm run e2e:headed
#	make stop-cluster
#
#.PHONY: docker-build-release
#docker-build-release: build-cross
#	for ARCH in $(ARCHITECTURES) ; do \
#		docker buildx build \
#			-t $(RELEASE_IMAGE)-$$ARCH:$(RELEASE_VERSION) \
#			-t $(RELEASE_IMAGE)-$$ARCH:latest \
#			--build-arg BUILDPLATFORM=linux/$$ARCH \
#			--platform linux/$$ARCH \
#			--push \
#			dist/$$ARCH ; \
#	done ; \
#
#.PHONY: docker-push-release
#docker-push-release: docker-build-release
#	docker manifest create --amend $(RELEASE_IMAGE):$(RELEASE_VERSION) $(RELEASE_IMAGE_NAMES) ; \
#  docker manifest create --amend $(RELEASE_IMAGE):latest $(RELEASE_IMAGE_NAMES_LATEST) ; \
#  docker manifest push $(RELEASE_IMAGE):$(RELEASE_VERSION) ; \
#  docker manifest push $(RELEASE_IMAGE):latest
#
#.PHONY: docker-build-head
#docker-build-head: build-cross
#	for ARCH in $(ARCHITECTURES) ; do \
#		docker buildx build \
#			-t $(HEAD_IMAGE)-$$ARCH:$(HEAD_VERSION) \
#			--build-arg BUILDPLATFORM=linux/$$ARCH \
#			--platform linux/$$ARCH \
#			--push \
#			dist/$$ARCH ; \
#	done ; \
#
#.PHONY: docker-push-head
#docker-push-head: docker-build-head
#	docker manifest create --amend $(HEAD_IMAGE):$(HEAD_VERSION) $(HEAD_IMAGE_NAMES)
#	docker manifest push $(HEAD_IMAGE):$(HEAD_VERSION) ; \
