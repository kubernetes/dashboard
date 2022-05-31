LICENSE_EYE_BINARY := $(shell which license-eye)
AIR_BINARY := $(shell which air)
GOLANGCI_LINT_BINARY := $(shell which golangci-lint)

GO_BINARY := $(shell which go)
GO_MAJOR_VERSION = $(shell go version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f1)
GO_MINOR_VERSION = $(shell go version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f2)
MIN_GO_MAJOR_VERSION = 1
MIN_GO_MINOR_VERSION = 18

.PHONY: install
install: ensure-go install-license-eye install-air install-golangci-lint

.PHONY: ensure-go
ensure-go:
ifndef GO_BINARY
	$(error "Cannot find go binary")
endif
	@if [ $(GO_MAJOR_VERSION) -gt $(MIN_GO_MAJOR_VERSION) ]; then \
		exit 0 ;\
  elif [ $(GO_MAJOR_VERSION) -lt $(MIN_GO_MAJOR_VERSION) ]; then \
		exit 1; \
  elif [ $(GO_MINOR_VERSION) -lt $(MIN_GO_MINOR_VERSION) ] ; then \
		exit 1; \
  fi

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
	@go install github.com/cosmtrek/air
else
	@echo "[tools] air already exists"
endif

.PHONY: install-golangci-lint
install-golangci-lint:
ifndef GOLANGCI_LINT_BINARY
	@echo "[tools] downloading golangci-lint..."
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint
else
	@echo "[tools] golangci-lint already exists"
endif

