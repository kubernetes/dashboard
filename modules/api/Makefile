ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

# Global makefile partial config
include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/kind.mk

# Local makefile partial config
include hack/include/config.mk

# List of targets that should be executed before other targets
PRE :=

# ==================== GLOBAL ==================== #

.PHONY: build
build: $(PRE)
	@echo "[$(APP_NAME)] Building"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o $(API_DIST_DIRECTORY)/$(APP_NAME) .

.PHONY: check
check: check-go

.PHONY: clean
clean:
	@echo "[$(APP_NAME)] Cleaning up"
	@rm -rf $(API_DIST_DIRECTORY)

.PHONY: coverage
coverage: DIR := $(TMP_DIRECTORY)
coverage: --ensure-dir
	@echo "[$(APP_NAME)] Running tests with coverage"
	@go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: fix
fix: fix-go

.PHONY: test
test:
	@echo "[$(APP_NAME)] Running tests"
	@go test $(PACKAGE_NAME)/...

# ==================== LOCAL ==================== #

.PHONY: check-go
check-go: $(PRE)
	@echo "[$(APP_NAME)] Running lint"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) ./...

.PHONY: codegen-update
codegen-update: --codegen-update-run --codegen-update-post

.PHONY: codegen-verify
codegen-verify: VERIFY_ONLY = true
codegen-verify: --codegen-verify-pre --codegen-update-run --codegen-verify-post

.PHONY: fix-go
fix-go: $(PRE)
	@echo "[$(APP_NAME)] Running lint --fix"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) --fix ./...

.PHONY: run
run: build
	@$(API_DIST_BINARY) \
		--kubeconfig=$(KUBECONFIG) \
		--metrics-provider=none

.PHONY: schema
schema: --ensure-kind-cluster build --swagger

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

.PHONY: --swagger
--swagger:
	@echo [$(APP_NAME)] Generating Swagger schema
	@$(API_DIST_BINARY) \
		--kubeconfig=$(KUBECONFIG) \
		--metrics-provider=none \
		--openapi-enabled >/dev/null 2>&1 & curl -s --retry 10 --retry-connrefused $(BIND_ADDRESS):$(PORT)/apidocs.json > $(SCHEMA_DIRECTORY)/swagger.json; pkill $(APP_NAME)
	@echo [$(APP_NAME)] Swagger schema generated successfully
