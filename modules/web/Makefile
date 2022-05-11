# Web UI Arguments (overridable)
SYSTEM_BANNER ?= "Local test environment"
SYSTEM_BANNER_SEVERITY ?= INFO
AUTO_GENERATE_CERTIFICATES ?= false

# Angular Serve Arguments
PROXY_CONFIG ?= proxy.conf.json
SSL_ENABLED ?= false

# List of targets that should be always executed before other targets
PRE = --ensure-version

MAKEFLAGS += -j2

.PHONY: serve
serve: $(PRE) --serve-go --serve-angular

.PHONY: serve-https
serve-https: $(PRE) --serve-go-https --serve-angular-https

.PHONY: build
build: $(PRE)
	scripts/build.sh

.PHONY: --serve-go
--serve-go:
	@go run k8s.io/dashboard/web \
		--system-banner=$(SYSTEM_BANNER) \
    --system-banner-severity=$(SYSTEM_BANNER_SEVERITY) \
    --auto-generate-certificates=$(AUTO_GENERATE_CERTIFICATES)

.PHONY: --serve-go-https
--serve-go-https: AUTO_GENERATE_CERTIFICATES = true
--serve-go-https: --serve-go

.PHONY: --serve-anulgar
--serve-angular:
	@npx ng serve --proxy-config $(PROXY_CONFIG) --ssl=$(SSL_ENABLED)

.PHONY: serve-anulgar-https
--serve-angular-https: PROXY_CONFIG = proxy-https.conf.json
--serve-angular-https: SSL_ENABLED = true
--serve-angular-https: --serve-angular

.PHONY: --ensure-version
--ensure-version:
	node ./scripts/version.mjs
