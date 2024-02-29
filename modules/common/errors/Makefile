ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../../..

# Global makefile partial config
include $(ROOT_DIRECTORY)/hack/include/config.mk

MODULE_NAME := "common.errors"
COVERAGE_FILE := $(TMP_DIRECTORY)/$(MODULE_NAME).coverage.out

# ==================== GLOBAL ==================== #

.PHONY: build
build:
	@echo "[$(MODULE_NAME)] Building"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" ./...

.PHONY: check
check:
	@echo "[$(MODULE_NAME)] Running lint"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) ./...

.PHONY: coverage
coverage: DIR := $(TMP_DIRECTORY)
coverage: --ensure-dir
	@echo "[$(MODULE_NAME)] Running tests with coverage"
	@go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic ./...

# Mocked target to allow global clean target to work
.PHONY: clean
clean:
	@:

.PHONY: fix
fix:
	@echo "[$(MODULE_NAME)] Running lint --fix"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) --fix ./...

.PHONY: test
test:
	@echo "[$(MODULE_NAME)] Running tests"
	@go test ./...


# ==================== PRIVATE ==================== #

.PHONY: --ensure-dir
--ensure-dir:
	@if [ -z "$(DIR)" ]; then \
  	echo "DIR variable not set" ; \
  	exit 1 ; \
  fi ; \
 	mkdir -p $(DIR) ; \

