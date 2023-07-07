ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include hack/include/config.mk

include $(ROOT_DIRECTORY)/hack/include/deploy.mk

# List of targets that should be executed before other targets
PRE := --ensure-dist-exists

.PHONY: --ensure-dist-exists
--ensure-dist-exists:
	@mkdir -p $(METRICS_SCRAPER_DIST_DIRECTORY)

.PHONY: check
check: check-go

.PHONY: check-go
check-go:
	golangci-lint run -c ../../.golangci.yml ./...

.PHONY: fix
fix: fix-go

.PHONY: fix-go
fix-go:
	golangci-lint run -c ../../.golangci.yml --fix ./...

.PHONY: test
test:
	go test $(PACKAGE_NAME)/...

.PHONY: coverage
coverage:
	go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: build
build: ARCHITECTURES = $(OS)/$(ARCH)
build: build-cross

.PHONY: build-cross
build-cross: $(PRE)
	@for ARCH in $(ARCHITECTURES) ; do \
  	os=$${ARCH%/*} ; \
  	arch=$${ARCH#*/} ; \
  	echo "Building metrics-scraper for $$os/$$arch" ; \
  	CGO_ENABLED=0 GOOS=$$os GOARCH=$$arch go build -gcflags="all=-N -l" -o $(METRICS_SCRAPER_DIST_DIRECTORY)/$$ARCH/$(APP_NAME) $(PACKAGE_NAME) ; \
  done

.PHONY: deploy
deploy: DOCKERFILE = $(METRICS_SCRAPER_DIRECTORY)/Dockerfile
deploy: --deploy

.PHONY: deploy-dev
deploy-dev: DOCKERFILE = $(METRICS_SCRAPER_DIRECTORY)/Dockerfile
deploy-dev: --deploy-dev

.PHONY: image
image: DOCKERFILE = $(METRICS_SCRAPER_DIRECTORY)/Dockerfile
image: --image
