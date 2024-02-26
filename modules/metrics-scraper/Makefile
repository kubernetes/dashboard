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
coverage: DIR := $(METRICS_SCRAPER_TMP_DIRECTORY)
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
build:
	@echo "Building $(APP_NAME)"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o $(METRICS_SCRAPER_DIST_DIRECTORY)/$(APP_NAME) $(PACKAGE_NAME)

.PHONY: check-go
check-go:
	golangci-lint run -c ../../.golangci.yml ./...

.PHONY: fix-go
fix-go:
	golangci-lint run -c ../../.golangci.yml --fix ./...

# ==================== PRIVATE ==================== #

.PHONY: --ensure-dir
--ensure-dir:
	@if [ -z "$(DIR)" ]; then \
  	echo "DIR variable not set" ; \
  	exit 1 ; \
  fi ; \
 	mkdir -p $(DIR) ; \
