ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

# Global makefile partial config
include $(ROOT_DIRECTORY)/hack/include/config.mk

# Local makefile partial config
include hack/include/config.mk

# List of targets that should be executed before other targets
PRE :=

# ==================== GLOBAL ==================== #

.PHONY: build
build: --clean build-go build-frontend

.PHONY: check
check: check-frontend check-go

.PHONY: clean
clean:
	@echo "[$(APP_NAME)] Cleaning up"
	@rm -rf $(WEB_DIST_DIRECTORY)

.PHONY: coverage
coverage: coverage-frontend coverage-go

.PHONY: fix
fix: fix-frontend fix-go

.PHONY: test
test: test-frontend test-go

# ==================== LOCAL ==================== #

.PHONY: build-frontend
build-frontend: --fix-locale-caching

.PHONY: build-go
build-go:
	@echo "[$(APP_NAME)] Building backend"
	@CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o $(WEB_DIST_DIRECTORY)/$(APP_NAME) $(PACKAGE_NAME)

.PHONY: check-frontend
check-frontend: $(PRE)
	@echo "[$(APP_NAME)] Running frontend checks"
	@yarn check

.PHONY: check-go
check-go: $(PRE)
	@echo "[$(APP_NAME)] Running lint"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) ./...

.PHONY: coverage-frontend
coverage-frontend: $(PRE)
	@echo "[$(APP_NAME)]  Running frontend tests with coverage"
	@yarn coverage

.PHONY: coverage-go
coverage-go: DIR := $(TMP_DIRECTORY)
coverage-go: --ensure-dir
	@echo "[$(APP_NAME)] Running tests with coverage"
	@go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: fix-frontend
fix-frontend: $(PRE)
	@echo "[$(APP_NAME)] Running yarn fix"
	@yarn fix

.PHONY: fix-go
fix-go: $(PRE)
	@echo "[$(APP_NAME)] Running lint --fix"
	@golangci-lint run -c $(GOLANGCI_LINT_CONFIG) --fix ./...

.PHONY: test-frontend
test-frontend:
	@echo "[$(APP_NAME)] Running frontend tests"
	@yarn test

.PHONY: test-go
test-go:
	@echo "[$(APP_NAME)] Running tests"
	@go test $(PACKAGE_NAME)/...

.PHONY: schema
schema:
	@echo "[$(APP_NAME)] Generating GraphQL schema"
	@npx graphql-mesh build --fileType json
	@chmod +rwx .mesh/schema.graphql
	@mv .mesh/schema.graphql $(SCHEMA_DIRECTORY)/schema.graphql
	@rm -rf .mesh
	@echo "[$(APP_NAME)] GraphQL schema generated successfully"

# ==================== PRIVATE ==================== #

# Avoid locale caching due to the same output file naming
# We'll add language code prefix to the generated main javascript file.
.PHONY: --fix-locale-caching
--fix-locale-caching: LANGUAGES = $(shell ls $(WEB_DIST_ANGULAR_DIRECTORY))
--fix-locale-caching: --ng-build
	@echo "[$(APP_NAME)] Patching locale caching" ; \
	for language in $(LANGUAGES) ; do \
  		localeDir=$(WEB_DIST_ANGULAR_DIRECTORY)/$${language} ; \
  		filename=$$(find $${localeDir} -name 'main.*.js' -exec basename {} \;) ; \
  		mv "$${localeDir}/$${filename}" "$${localeDir}/$${language}.$${filename}" ; \
  		perl -i -pe"s/$${filename}/$${language}.$${filename}/" "$${localeDir}/index.html" ; \
	done ; \
	cp "$(WEB_DIRECTORY)/i18n/locale_conf.json" "$(WEB_DIST_ANGULAR_DIRECTORY)" ; \

.PHONY: --ng-build
--ng-build: --ensure-dependencies
	@echo "[$(APP_NAME)] Building localized frontend" ; \
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
	@echo "[$(APP_NAME)] Installing dependencies"
	@yarn install --immutable
endif

.PHONY: --ensure-dir
--ensure-dir:
	@if [ -z "$(DIR)" ]; then \
  	echo "DIR variable not set" ; \
  	exit 1 ; \
  fi ; \
 	mkdir -p $(DIR) ; \
