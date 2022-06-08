GATEWAY_DIRECTORY := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
ROOT_DIRECTORY = $(GATEWAY_DIRECTORY)/../..
CERTIFICATES_OUT_DIRECTORY = $(ROOT_DIRECTORY)/.dist/certificates
CERTIFICATES_DIRECTORY = $(GATEWAY_DIRECTORY)/certificates

.PHONY: generate-certificates
generate-certificates: --ensure-dir
	@openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $(CERTIFICATES_OUT_DIRECTORY)/private.key -out $(CERTIFICATES_OUT_DIRECTORY)/public.crt -config $(CERTIFICATES_DIRECTORY)/localhost.conf 2>/dev/null

.PHONY: --ensure-dir
--ensure-dir:
	@mkdir -p $(CERTIFICATES_OUT_DIRECTORY)
