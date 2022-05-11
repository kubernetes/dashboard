MODULES_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
API_DIRECTORY = $(MODULES_DIRECTORY)/api
WEB_DIRECTORY = $(MODULES_DIRECTORY)/web

MAKEFLAGS += -j2

.PHONY: serve
serve: --serve-api --serve-web

.PHONY: serve-https
serve-https: --serve-api-https --serve-web-https

.PHONY: build
build: --build-api --build-web

.PHONY: --serve-api
--serve-api:
	@$(MAKE) --no-print-directory -C $(API_DIRECTORY) serve

.PHONY: --serve-web
--serve-web:
	@$(MAKE) --no-print-directory -C $(WEB_DIRECTORY) serve

.PHONY: --serve-api-https
--serve-api-https:
	@$(MAKE) --no-print-directory -C $(API_DIRECTORY) serve-https

.PHONY: --serve-web-https
--serve-web-https:
	@$(MAKE) --no-print-directory -C $(WEB_DIRECTORY) serve-https

.PHONY: --build-api
--build-api:
	@$(MAKE) --no-print-directory -C $(API_DIRECTORY) build

.PHONY: --build-web
--build-web:
	@$(MAKE) --no-print-directory -C $(WEB_DIRECTORY) build
