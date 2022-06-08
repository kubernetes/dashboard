# Unused
SHELL = /bin/bash
GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)
#GOPATH ?= $(shell go env GOPATH)
CODEGEN_VERSION := v0.23.6
CODEGEN_BIN := $(GOPATH)/pkg/mod/k8s.io/code-generator@$(CODEGEN_VERSION)/generate-groups.sh
GO_COVERAGE_FILE = $(ROOT_DIRECTORY)/coverage/go.txt
COVERAGE_DIRECTORY = $(ROOT_DIRECTORY)/coverage
MAIN_PACKAGE = github.com/kubernetes/dashboard/src/app/backend

PROD_BINARY = .dist/amd64/web/dashboard
SERVE_DIRECTORY = .dist/web
SERVE_BINARY = .dist/web/dashboard
RELEASE_IMAGE = kubernetesui/dashboard
RELEASE_VERSION = v2.6.0
RELEASE_IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):$(RELEASE_VERSION))
RELEASE_IMAGE_NAMES_LATEST += $(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):latest)
HEAD_IMAGE = kubernetesdashboarddev/dashboard
HEAD_VERSION = latest
HEAD_IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(HEAD_IMAGE)-$(arch):$(HEAD_VERSION))
ARCHITECTURES = amd64 arm64 arm ppc64le s390x

# Dirs and paths
ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
MODULES_DIRECTORY := $(ROOT_DIRECTORY)/modules
TOOLS_DIRECTORY := $(MODULES_DIRECTORY)/common/tools
GATEWAY_DIRECTORY := $(ROOT_DIRECTORY)/hack/gateway
HACK_DIRECTORY := $(ROOT_DIRECTORY)/hack

DOCKER_COMPOSE_PATH := $(HACK_DIRECTORY)/docker.compose.yaml

# Used by the run target to configure the application
KUBECONFIG ?= $(HOME)/.kube/config
WEB_SYSTEM_BANNER ?= "Local test environment"
WEB_SYSTEM_BANNER_SEVERITY ?= INFO
API_ENABLE_SKIP_LOGIN ?= true
API_SIDECAR_HOST ?= http://sidecar:8000
API_TOKEN_TTL ?= 0 # Never expire

# List of targets that should be always executed before other targets
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
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) serve

# Starts development version of the application with HTTPS enabled.
#
# URL: https://localhost:8080
#
# Note: Make sure that the port 8080 is free on your localhost
.PHONY: serve-https
serve-https: $(PRE)
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) serve-https

# Starts a prod version of the application.
#
# URL: https://localhost:4443
#
# Note: Make sure that the port 4443 is free on your localhost
.PHONY: run
run: $(PRE) --ensure-compose-down compose
	@KUBECONFIG=$(KUBECONFIG) \
	WEB_SYSTEM_BANNER=$(WEB_SYSTEM_BANNER) \
	WEB_SYSTEM_BANNER_SEVERITY=$(WEB_SYSTEM_BANNER_SEVERITY) \
	API_ENABLE_SKIP_LOGIN=$(API_ENABLE_SKIP_LOGIN) \
	API_SIDECAR_HOST=$(API_SIDECAR_HOST) \
	API_TOKEN_TTL=$(API_TOKEN_TTL) \
	docker compose -f $(DOCKER_COMPOSE_PATH) up

.PHONY: compose
compose: --ensure-certificates build
	@KUBECONFIG=$(KUBECONFIG) \
	WEB_SYSTEM_BANNER=$(WEB_SYSTEM_BANNER) \
	WEB_SYSTEM_BANNER_SEVERITY=$(WEB_SYSTEM_BANNER_SEVERITY) \
	API_ENABLE_SKIP_LOGIN=$(API_ENABLE_SKIP_LOGIN) \
	API_SIDECAR_HOST=$(API_SIDECAR_HOST) \
	API_TOKEN_TTL=$(API_TOKEN_TTL) \
	docker compose -f $(DOCKER_COMPOSE_PATH) build

.PHONY: build
build:
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) build

.PHONY: --ensure-tools
--ensure-tools:
	@$(MAKE) --no-print-directory -C $(TOOLS_DIRECTORY) install

.PHONY: --ensure-compose-down
--ensure-compose-down:
	@KUBECONFIG=$(KUBECONFIG) \
	WEB_SYSTEM_BANNER=$(WEB_SYSTEM_BANNER) \
	WEB_SYSTEM_BANNER_SEVERITY=$(WEB_SYSTEM_BANNER_SEVERITY) \
	API_ENABLE_SKIP_LOGIN=$(API_ENABLE_SKIP_LOGIN) \
	API_SIDECAR_HOST=$(API_SIDECAR_HOST) \
	API_TOKEN_TTL=$(API_TOKEN_TTL) \
	docker compose -f $(DOCKER_COMPOSE_PATH) down

.PHONY: --ensure-certificates
--ensure-certificates:
	@$(MAKE) --no-print-directory -C $(GATEWAY_DIRECTORY) generate-certificates

#.PHONY: ensure-codegen
#ensure-codegen: ensure-go
#	go get -d k8s.io/code-generator@$(CODEGEN_VERSION)
#	go mod tidy
#	chmod +x $(CODEGEN_BIN)
#
#.PHONY: clean
#clean:
#	rm -rf .tmp
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
#.PHONY: test-backend
#test-backend: ensure-go
#	go test $(MAIN_PACKAGE)/...
#
#.PHONY: test-frontend
#test-frontend:
#	npx jest -c aio/jest.config.js
#
#.PHONY: test
#test: test-backend test-frontend
#
#.PHONY: coverage-backend
#coverage-backend: ensure-go
#	$(shell mkdir -p $(COVERAGE_DIRECTORY)) \
#	go test -coverprofile=$(GO_COVERAGE_FILE) -covermode=atomic $(MAIN_PACKAGE)/...
#
#.PHONY: coverage-frontend
#coverage-frontend:
#	npx jest -c aio/jest.config.js --coverage -i
#
#.PHONY: coverage
#coverage: coverage-backend coverage-frontend
#
#.PHONY: check-i18n
#check-i18n: fix-i18n
#
#.PHONY: fix-i18n
#fix-i18n:
#	./aio/scripts/pre-commit-i18n.sh
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
#.PHONY: check-html
#check-html:
#	./aio/scripts/check-html.sh
#
#.PHONY: fix-html
#fix-html:
#	npx html-beautify -f=./src/**/*.html
#
#.PHONY: check-scss
#check-scss:
#	stylelint "src/**/*.scss"
#
#.PHONY: fix-scss
#fix-scss:
#	stylelint "src/**/*.scss" --fix
#
#.PHONY: check-ts
#check-ts:
#	gts lint
#
#.PHONY: fix-ts
#fix-ts:
#	gts fix
#
#.PHONY: check-backend
#check-backend: check-license check-go check-codegen
#
#.PHONY: fix-backend
#fix-backend: fix-license fix-go fix-codegen
#
#.PHONY: check-frontend
#check-frontend: check-i18n check-license check-html check-scss check-ts
#
#.PHONY: fix-frontend
#fix-frontend: fix-i18n fix-license fix-html fix-scss fix-ts
#
#.PHONY: check
#check: check-i18n check-license check-go check-codegen check-html check-scss check-ts
#
#.PHONY: fix
#fix: fix-i18n fix-license fix-go fix-codegen  fix-html fix-scss fix-ts
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
