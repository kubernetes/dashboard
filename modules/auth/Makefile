ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include hack/include/config.mk

include $(ROOT_DIRECTORY)/hack/include/deploy.mk

# List of targets that should be executed before other targets
PRE := --ensure-dist-exists

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

.PHONY: build
build: ARCHITECTURES = $(OS)/$(ARCH)
build: build-cross

.PHONY: build-cross
build-cross: $(PRE)
	@for ARCH in $(ARCHITECTURES) ; do \
  	os=$${ARCH%/*} ; \
  	arch=$${ARCH#*/} ; \
  	echo "Building dashboard-api for $$os/$$arch" ; \
  	CGO_ENABLED=0 GOOS=$$os GOARCH=$$arch go build -ldflags "-X $(PACKAGE_NAME)/client.Version=$(RELEASE_VERSION)" -gcflags="all=-N -l" -o $(AUTH_DIST_DIRECTORY)/$$ARCH/$(APP_NAME) $(PACKAGE_NAME) ; \
  done

.PHONY: test
test:
	go test $(PACKAGE_NAME)/...

.PHONY: coverage
coverage:
	go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: --ensure-dist-exists
--ensure-dist-exists:
	@mkdir -p $(AUTH_DIST_DIRECTORY)
