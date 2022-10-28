ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include $(API_DIRECTORY)/hack/include/config.mk
include $(WEB_DIRECTORY)/hack/include/config.mk

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
--compose: --ensure-certificates build
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
