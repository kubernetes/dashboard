MODULES_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
API_DIRECTORY = $(MODULES_DIRECTORY)/api
WEB_DIRECTORY = $(MODULES_DIRECTORY)/web

.PHONY: serve
serve:
	@$(MAKE) --no-print-directory -j 2 serve-api serve-web

.PHONY: serve-https
serve-https:
	@$(MAKE) --no-print-directory -j 2 serve-api-https serve-web-https

######################
# DO NOT RUN MANUALLY
######################
.PHONY: serve-api
serve-api:
	@$(MAKE) --no-print-directory -C $(API_DIRECTORY) serve

.PHONY: serve-web
serve-web:
	@$(MAKE) --no-print-directory -C $(WEB_DIRECTORY) serve

.PHONY: serve-api-https
serve-api-https:
	@$(MAKE) --no-print-directory -C $(API_DIRECTORY) serve-https

.PHONY: serve-web-https
serve-web-https:
	@$(MAKE) --no-print-directory -C $(WEB_DIRECTORY) serve-https
