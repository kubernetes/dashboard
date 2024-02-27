ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

# Global makefile partial config
include $(ROOT_DIRECTORY)/hack/include/config.mk

# Local makefile partial config
include hack/include/config.mk

# List of targets that should be executed before other targets
PRE :=

# ==================== GLOBAL ==================== #

.PHONY: check
check: check-go

.PHONY: coverage
coverage: DIR := $(API_TMP_DIRECTORY)
coverage: --ensure-dir
	@echo "Running tests with coverage"
	@go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: fix
fix: fix-go

.PHONY: test
test:
	@echo "Running tests"
	@go test $(PACKAGE_NAME)/...

# ==================== LOCAL ==================== #

.PHONY: build
build: $(PRE)
	@echo "Building dashboard-api"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w -X $(PACKAGE_NAME)/client.Version=$(APP_VERSION)" -o $(API_DIST_DIRECTORY)/$(APP_NAME) $(PACKAGE_NAME)

.PHONY: check-go
check-go: $(PRE)
	@echo "Running lint"
	@golangci-lint run -c ../../.golangci.yml ./...

.PHONY: codegen-update
codegen-update: --codegen-update-run --codegen-update-post

.PHONY: codegen-verify
codegen-verify: VERIFY_ONLY = true
codegen-verify: --codegen-verify-pre --codegen-update-run --codegen-verify-post

.PHONY: fix-go
fix-go: $(PRE)
	@echo "Running lint --fix"
	golangci-lint run -c ../../.golangci.yml --fix ./...

.PHONY: run
run: build
	@$(API_DIST_BINARY) --kubeconfig=$(KUBECONFIG) \
		--sidecar-host=$(SIDECAR_HOST) \
		--auto-generate-certificates=$(AUTO_GENERATE_CERTIFICATES)

# ==================== PRIVATE ==================== #

.PHONY: --codegen-update-run
--codegen-update-run:
	@${GOPATH}/bin/client-gen \
		--go-header-file=$(TOOLS_DIRECTORY)/boilerplate.go.txt \
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

.PHONY: --ensure-dir
--ensure-dir:
	@if [ -z "$(DIR)" ]; then \
  	echo "DIR variable not set" ; \
  	exit 1 ; \
  fi ; \
 	mkdir -p $(DIR) ; \
