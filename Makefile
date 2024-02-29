ROOT_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/ensure.mk

include $(API_DIRECTORY)/hack/include/config.mk
include $(WEB_DIRECTORY)/hack/include/config.mk

# List of targets that should be executed before other targets
PRE = --ensure-tools clean

.PHONY: help
help:
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# ============================ GLOBAL ============================ #
#
# A global list of targets executed for every module, it includes:
# - all modules in 'modules' directory except 'modules/common'
# - all common modules in 'modules/common' directory except 'modules/common/tools'
#
# ================================================================ #

.PHONY: build
build: $(PRE) ## Runs all available checks
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=build

.PHONY: check
check: $(PRE) check-license ## Runs all available checks
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=check

.PHONY: clean
clean: --clean ## Clean up all temporary directories
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=clean

.PHONY: coverage
coverage: $(PRE) ## Runs all available test coverage scripts
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=coverage

.PHONY: fix
fix: $(PRE) fix-license ## Runs all available fix scripts
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=fix

.PHONY: test
test: $(PRE) ## Runs all available test scripts
	@$(MAKE) --no-print-directory -C $(MODULES_DIRECTORY) TARGET=test

# ============================ Local ============================ #

.PHONY: check-license
check-license: $(PRE) ## Checks if repo files contain valid license header
	@echo "Running license check"
	@${GOPATH}/bin/license-eye header check

.PHONY: fix-license
fix-license: $(PRE) ## Adds missing license header to repo files
	@echo "Running license check --fix"
	@${GOPATH}/bin/license-eye header fix

.PHONY: tools
tools: $(PRE) ## Installs required tools

# Starts development version of the application.
#
# URL: http://localhost:8080
#
# Note: Make sure that the port 8080 (Web HTTP) is free on your localhost
.PHONY: serve
serve: $(PRE) --ensure-kind-cluster ## Starts development version of the application on http://localhost:8080
	@KUBECONFIG=$(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	docker compose -f $(DOCKER_COMPOSE_DEV_PATH) --project-name=$(PROJECT_NAME) up \
		--build \
		--remove-orphans \
		--no-attach gateway \
		--no-attach scraper \
		--no-attach metrics-server

# Starts production version of the application.
#
# HTTPS: https://localhost:8443
# HTTP: https://localhost:8080
#
# Note: Make sure that the ports 8443 (Gateway HTTPS) and 8080 (Gateway HTTP) are free on your localhost
.PHONY: run
run: $(PRE) --ensure-kind-cluster ## Starts production version of the application on https://localhost:8443 and https://localhost:8000
	@KUBECONFIG=$(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH) \
	SYSTEM_BANNER=$(SYSTEM_BANNER) \
	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
	SIDECAR_HOST=$(SIDECAR_HOST) \
	VERSION="v0.0.0-prod" \
	docker compose -f $(DOCKER_COMPOSE_PATH) --project-name=$(PROJECT_NAME) up \
		--build \
		--remove-orphans \
		--no-attach gateway \
		--no-attach scraper \
		--no-attach metrics-server

.PHONY: image
image:
		@KUBECONFIG=$(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH) \
  	SYSTEM_BANNER=$(SYSTEM_BANNER) \
  	SYSTEM_BANNER_SEVERITY=$(SYSTEM_BANNER_SEVERITY) \
  	SIDECAR_HOST=$(SIDECAR_HOST) \
  	VERSION="v0.0.0-prod" \
  	docker compose -f $(DOCKER_COMPOSE_PATH) --project-name=$(PROJECT_NAME) build \
  	--no-cache

# ============================ Private ============================ #

.PHONY: --clean
--clean:
	@echo "[Global] Cleaning up"
	@rm -rf $(TMP_DIRECTORY)
