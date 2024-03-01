ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

# Global makefile partial config
include $(ROOT_DIRECTORY)/hack/include/config.mk

# Local makefile partial config
include hack/include/config.mk

# List of targets that should be executed before other targets
PRE :=

# ==================== GLOBAL ==================== #

.PHONY: build
build:
	@echo "[$(APP_NAME)] Building"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o $(AUTH_DIST_DIRECTORY)/$(APP_NAME) $(PACKAGE_NAME)

.PHONY: check
check: check-go

.PHONY: clean
clean:
	@echo "[$(APP_NAME)] Cleaning up"
	@rm -rf $(AUTH_DIST_DIRECTORY)

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

.PHONY: fix-go
fix-go: $(PRE)
	@echo "[$(APP_NAME)] Running lint --fix"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) --fix ./...

# ==================== PRIVATE ==================== #

.PHONY: --ensure-dir
--ensure-dir:
	@if [ -z "$(DIR)" ]; then \
  	echo "DIR variable not set" ; \
  	exit 1 ; \
  fi ; \
 	mkdir -p $(DIR) ; \

