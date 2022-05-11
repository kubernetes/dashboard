LICENSE_EYE_BINARY := $(shell which license-eye)
AIR_BINARY := $(shell which air)
GOLANGCI_LINT_BINARY := $(shell which golangci-lint)

.PHONY: install
install: install-license-eye install-air install-golangci-lint

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

.PHONY: install-golangci-lint
install-golangci-lint:
ifndef GOLANGCI_LINT_BINARY
	@echo "[tools] downloading golangci-lint..."
	@go install github.com/apache/skywalking-eyes/cmd/license-eye
else
	@echo "[tools] golangci-lint already exists"
endif

