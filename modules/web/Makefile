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
coverage: coverage-go

.PHONY: fix
fix: fix-go

.PHONY: test
test: test-go

# ==================== LOCAL ==================== #

.PHONY: build
build: --clean build-go build-angular

.PHONY: build-angular
build-angular: --fix-locale-caching

.PHONY: build-go
build-go:
	@echo "Building $(APP_NAME)"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o $(WEB_DIST_DIRECTORY)/$(APP_NAME) $(PACKAGE_NAME)

.PHONY: check-go
check-go: $(PRE)
	golangci-lint run -c ../../.golangci.yml ./...

.PHONY: coverage-go
coverage-go: DIR := $(WEB_TMP_DIRECTORY)
coverage-go:
	@echo "Running tests with coverage"
	@go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: fix-go
fix-go: $(PRE)
	golangci-lint run -c ../../.golangci.yml --fix ./...

.PHONY: test-go
test-go:
	@echo "Running tests"
	@go test $(PACKAGE_NAME)/...

# ==================== PRIVATE ==================== #

# Avoid locale caching due to the same output file naming
# We'll add language code prefix to the generated main javascript file.
.PHONY: --fix-locale-caching
--fix-locale-caching: LANGUAGES = $(shell ls $(WEB_DIST_ANGULAR_DIRECTORY))
--fix-locale-caching: --ng-build
	@echo "Patching locale caching" ; \
	for language in $(LANGUAGES) ; do \
  		localeDir=$(WEB_DIST_ANGULAR_DIRECTORY)/$${language} ; \
  		filename=$$(find $${localeDir} -name 'main.*.js' -exec basename {} \;) ; \
  		mv "$${localeDir}/$${filename}" "$${localeDir}/$${language}.$${filename}" ; \
  		perl -i -pe"s/$${filename}/$${language}.$${filename}/" "$${localeDir}/index.html" ; \
	done ; \
	cp "$(WEB_DIRECTORY)/i18n/locale_conf.json" "$(WEB_DIST_ANGULAR_DIRECTORY)" ; \

.PHONY: --ng-build
--ng-build: --ensure-dependencies
	@echo "Building localized frontend" ; \
	npx ng build \
      --configuration production \
      --localize \
      --output-path="$(WEB_DIST_ANGULAR_DIRECTORY)"

.PHONY: --clean
--clean:
	@rm -rf $(WEB_DIST_DIRECTORY) || true
	@mkdir -p $(WEB_DIST_ANGULAR_DIRECTORY)

.PHONY: --ensure-dependencies
--ensure-dependencies:
ifeq ($(wildcard node_modules/.*),)
	@echo "Installing dependencies"
	@yarn install --immutable
endif

.PHONY: --ensure-dir
--ensure-dir:
	@if [ -z "$(DIR)" ]; then \
  	echo "DIR variable not set" ; \
  	exit 1 ; \
  fi ; \
 	mkdir -p $(DIR) ; \
