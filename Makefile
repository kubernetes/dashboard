ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk
include $(ROOT_DIRECTORY)/hack/include/ensure.mk

include $(API_DIRECTORY)/hack/include/config.mk
include $(WEB_DIRECTORY)/hack/include/config.mk

# List of targets that should be executed before other targets
PRE = --ensure-tools

.PHONY: help
help:
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

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
serve: $(PRE) --ensure-kind-cluster ## Starts development version of the application on http://localhost:8080
	@KUBECONFIG=$(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	ENABLE_SKIP_LOGIN=$(ENABLE_SKIP_LOGIN) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	TOKEN_TTL=$(TOKEN_TTL) \
	CLUSTER_VERSION=$(KIND_CLUSTER_VERSION) \
	docker compose -f $(DOCKER_COMPOSE_DEV_PATH) --project-name=$(PROJECT_NAME) up web-angular \
		--build \
		--remove-orphans \
		--no-attach gateway \
		--no-attach scraper \
		--no-attach metrics-server

# Starts production version of the application.
#
# HTTPS: https://localhost:8443
# HTTP: https://localhost:8000
#
# Note: Make sure that the ports 8443 (Gateway HTTPS) and 8000 (Gateway HTTP) are free on your localhost
# Note #3: Darwin doesn't work at the moment, so we are using Linux by default.
.PHONY: run
run: export OS := linux
run: $(PRE) build --ensure-kind-cluster ## Starts production version of the application on https://localhost:8443 and https://localhost:8000
	@KUBECONFIG=$(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	ENABLE_SKIP_LOGIN=$(ENABLE_SKIP_LOGIN) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	TOKEN_TTL=$(TOKEN_TTL) \
	ARCH=$(ARCH) \
	OS=$(OS) \
	docker compose -f $(DOCKER_COMPOSE_PATH) --project-name=$(PROJECT_NAME) up \
		--build \
		--remove-orphans \
		--no-attach gateway \
		--no-attach scraper \
		--no-attach metrics-server

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

.PHONY: image
image: export OS := linux
image: build ## Builds containers targeting host architecture
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=image
