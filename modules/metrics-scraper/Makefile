ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include hack/include/config.mk

include $(ROOT_DIRECTORY)/hack/include/deploy.mk

# List of targets that should be executed before other targets
PRE := ""

.PHONY: check
check: check-go

.PHONY: check-go
check-go: $(PRE)
	golangci-lint run -c ../../.golangci.yml ./...

.PHONY: fix
fix: fix-go

.PHONY: fix-go
fix-go: $(PRE)
	golangci-lint run -c ../../.golangci.yml --fix ./...

.PHONY: test
test:
	go test $(PACKAGE_NAME)/...

.PHONY: coverage
coverage:
	go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...
