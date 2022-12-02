ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include $(API_DIRECTORY)/hack/include/config.mk
include $(WEB_DIRECTORY)/hack/include/config.mk

MAKEFLAGS += -j2

# List of targets that should be executed before other targets
PRE = --ensure-tools

.PHONY: help
help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: check
check: $(PRE) check-license ## Runs all available checks
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=check

.PHONY: fix
fix: $(PRE) fix-license ## Runs all available fix scripts
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=fix

.PHONY: check-license
check-license: $(PRE) ## Checks if repo files contain valid license header
	@${GOPATH}/bin/license-eye header check

.PHONY: fix-license
fix-license: $(PRE) ## Adds missing license header to repo files
	@${GOPATH}/bin/license-eye header fix

# Starts development version of the application.
#
# URL: http://localhost:8080
#
# Note: Make sure that the port 8080 is free on your localhost
.PHONY: serve
serve: $(PRE) ## Starts development version of the application on: http://localhost:8080
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=serve

# Starts development version of the application with HTTPS enabled.
#
# URL: https://localhost:8080
#
# Note: Make sure that the port 8080 is free on your localhost
# Note #2: Does not work with "kind".
.PHONY: serve-https
serve-https: $(PRE) ## Starts development version of the application with HTTPS enabled on: https://localhost:8080
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=serve-https

# Starts production version of the application.
#
# URL: https://localhost:4443
#
# Note: Make sure that the ports 4443 (Gateway) and 9001 (API) are free on your localhost
# Note #2: Does not work with "kind".
# Note #3: Darwin doesn't work at the moment, so we are using Linux by default.
.PHONY: run
run: $(PRE) --ensure-linux --ensure-compose-down --compose ## Starts production version of the application on https://localhost:4443
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
build: build-cross ## Builds the application for the architecture of the host machine

.PHONY: build-cross
build-cross: ## Builds the application for all supported architectures
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=$(or $(TARGET),build-cross)

.PHONY: deploy
deploy: build-cross ## Builds and deploys all module containers to the configured registries
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=deploy

.PHONY: deploy-dev
deploy-dev: build-cross ## Builds and deploys all module containers to the configured dev registries
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=deploy-dev

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

.PHONY: --ensure-linux
--ensure-linux:
  export OS=linux

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


