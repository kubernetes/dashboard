# Web UI Arguments (overridable)
SYSTEM_BANNER ?= "Local test environment"
SYSTEM_BANNER_SEVERITY ?= INFO

PRE = ensure-version

.PHONY: serve
serve: $(PRE)
	@$(MAKE) --no-print-directory -j 2 serve-go serve-angular

.PHONY: serve-https
serve-https: $(PRE)
	@$(MAKE) --no-print-directory -j 2 serve-go-https serve-angular-https

######################
# DO NOT RUN MANUALLY
######################
.PHONY: serve-go
serve-go:
	@go run k8s.io/dashboard/web \
		--system-banner=$(SYSTEM_BANNER) \
    --system-banner-severity=$(SYSTEM_BANNER_SEVERITY)

.PHONY: serve-anulgar
serve-angular:
	@npx ng serve --proxy-config proxy.conf.json

.PHONY: serve-go-https
serve-go-https:
	@go run k8s.io/dashboard/web \
		--system-banner=$(SYSTEM_BANNER) \
    --system-banner-severity=$(SYSTEM_BANNER_SEVERITY) \
    --auto-generate-certificates

.PHONY: serve-anulgar-https
serve-angular-https:
	@npx ng serve --proxy-config proxy-https.conf.json --ssl

.PHONY: ensure-version
ensure-version:
	node ./scripts/version.mjs
