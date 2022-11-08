ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include hack/include/config.mk

include $(ROOT_DIRECTORY)/hack/include/deploy.mk

MAKEFLAGS += -j2

.PHONY: serve
serve: $(PRE) --serve-go --serve-angular

.PHONY: serve-https
serve-https: AUTO_GENERATE_CERTIFICATES = true
serve-https: PROXY_CONFIG = proxy-https.conf.json
serve-https: SSL_ENABLED = true
serve-https: $(PRE) --serve-go --serve-angular

.PHONY: serve-frontend
serve-frontend: $(PRE) --serve-angular

.PHONY: build
build: ARCHITECTURES = $(OS)/$(ARCH)
build: build-cross

.PHONY: build-cross
build-cross: --clean --build-go --build-angular

.PHONY: deploy
deploy: DOCKERFILE = $(WEB_DIRECTORY)/Dockerfile
deploy: --deploy

.PHONY: deploy-dev
deploy-dev: DOCKERFILE = $(WEB_DIRECTORY)/Dockerfile
deploy-dev: --deploy-dev

.PHONY: --serve-go
--serve-go:
	go run k8s.io/dashboard/web \
		--system-banner=$(SYSTEM_BANNER) \
    --system-banner-severity=$(SYSTEM_BANNER_SEVERITY) \
    --auto-generate-certificates=$(AUTO_GENERATE_CERTIFICATES)

.PHONY: --serve-angular
--serve-angular: --ensure-dependencies
	@npx ng serve --proxy-config=$(PROXY_CONFIG) --ssl=$(SSL_ENABLED)

.PHONY: --build-go
--build-go:
	@for ARCH in $(ARCHITECTURES) ; do \
  	os=$${ARCH%/*} ; \
  	arch=$${ARCH#*/} ; \
  	echo "Building dashboard-web for $$os/$$arch" ; \
  	CGO_ENABLED=0 GOOS=$$os GOARCH=$$arch go build -ldflags "-X $(PACKAGE_NAME)/client.Version=$(RELEASE_VERSION)" -gcflags="all=-N -l" -o $(WEB_DIST_DIRECTORY)/$$ARCH/$(APP_NAME) $(PACKAGE_NAME) ; \
	done ; \

.PHONY: --build-angular
--build-angular: --copy-angular

.PHONY: --copy-angular
--copy-angular: LANGUAGES = $(shell ls $(WEB_DIST_ANGULAR_DIRECTORY))
--copy-angular: --fix-locale-caching
	@echo "Copying frontend to the dashboard-web API" ; \
	for arch in $(ARCHITECTURES) ; do \
		for language in $(LANGUAGES) ; do \
			outDir=$(WEB_DIST_DIRECTORY)/$${arch}/public ; \
      mkdir -p $${outDir} ; \
      cp -r $(WEB_DIST_ANGULAR_DIRECTORY)/$${language} $${outDir} ; \
    done ; \
	done ; \
	rm -rf $(WEB_DIST_ANGULAR_DIRECTORY)

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
	@rm -rf $(WEB_DIST_DIRECTORY)
	@mkdir -p $(WEB_DIST_ANGULAR_DIRECTORY)

.PHONY: --ensure-dependencies
--ensure-dependencies:
ifeq ($(wildcard node_modules/.*),)
	@echo "Installing dependencies"
	@yarn install --immutable
endif
