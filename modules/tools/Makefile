LICENSE_EYE_BINARY := $(shell which license-eye)
AIR_BINARY := $(shell which air)

.PHONY: install
install: install-license-eye install-air

.PHONY: install-license-eye
install-license-eye:
ifndef LICENSE_EYE_BINARY
	@echo "[tools] downloading license-eye..."
	@go install github.com/apache/skywalking-eyes/cmd/license-eye
else
	@echo "[tools] license-eye already exists"
endif

.PHONY: install-air
install-air:
ifndef AIR_BINARY
	@echo "[tools] downloading air..."
	@go install github.com/apache/skywalking-eyes/cmd/license-eye
else
	@echo "[tools] air already exists"
endif
