NODE_BINARY := $(shell which node)
NODE_MAJOR_VERSION = $(shell node --version | cut -d'.' -f1 | cut -d'v' -f2 )
NODE_MINOR_VERSION = $(shell node --version | cut -d'.' -f2)
MIN_NODE_MAJOR_VERSION = 18
MIN_NODE_MINOR_VERSION = 14

YARN_BINARY := $(shell which yarn)

GO_BINARY := $(shell which go)
GO_MAJOR_VERSION = $(shell go version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f1)
GO_MINOR_VERSION = $(shell go version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f2)
MIN_GO_MAJOR_VERSION = 1
MIN_GO_MINOR_VERSION = 20

LICENSE_EYE_BINARY := $(shell which license-eye)
AIR_BINARY := $(shell which air)
GOLANGCI_LINT_BINARY := $(shell which golangci-lint)
CLIENT_GEN_BINARY := $(shell which client-gen)
KIND_BINARY := $(shell which kind)

.PHONY: install
install: ensure-node ensure-yarn ensure-go install-license-eye install-air install-golangci-lint install-client-gen install-kind

.PHONY: ensure-node
ensure-node:
ifndef NODE_BINARY
	$(error "Cannot find node binary")
endif
	@if [ $(NODE_MAJOR_VERSION) -gt $(MIN_NODE_MAJOR_VERSION) ]; then \
		echo "[tools] node version requirements met"; \
		exit 0 ;\
	elif [ $(NODE_MAJOR_VERSION) -lt $(MIN_NODE_MAJOR_VERSION) ]; then \
		echo "[tools] node version older than required v$(MIN_NODE_MAJOR_VERSION).$(MIN_NODE_MINOR_VERSION).0+"; \
		exit 1; \
	elif [ $(NODE_MINOR_VERSION) -lt $(NODE_MINOR_VERSION) ] ; then \
		echo "[tools] node version older than required v$(MIN_NODE_MAJOR_VERSION).$(MIN_NODE_MINOR_VERSION).0+"; \
		exit 1; \
	else \
		echo "[tools] node version requirements met"; \
	fi

.PHONY: ensure-yarn
ensure-yarn:
ifndef YARN_BINARY
	@echo "[tools] yarn required to build front-end"
	@echo "[tools] see how to install yarn at: https://yarnpkg.com/getting-started/install"
else
	@echo "[tools] yarn already exists"
endif

.PHONY: ensure-go
ensure-go:
ifndef GO_BINARY
	$(error "Cannot find go binary")
endif
	@if [ $(GO_MAJOR_VERSION) -gt $(MIN_GO_MAJOR_VERSION) ]; then \
		exit 0 ;\
	elif [ $(GO_MAJOR_VERSION) -lt $(MIN_GO_MAJOR_VERSION) ]; then \
		echo "[tools] go version older than required v$(MIN_GO_MAJOR_VERSION).$(MIN_GO_MINOR_VERSION).0+"; \
		exit 1; \
	elif [ $(GO_MINOR_VERSION) -lt $(MIN_GO_MINOR_VERSION) ] ; then \
		echo "[tools] go version older than required v$(MIN_GO_MAJOR_VERSION).$(MIN_GO_MINOR_VERSION).0+"; \
		exit 1; \
	else \
		echo "[tools] golang version requirements met"; \
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
	@go install github.com/air-verse/air
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

.PHONY: install-client-gen
install-client-gen:
ifndef CLIENT_GEN_BINARY
	@echo "[tools] downloading client-gen..."
	@go install k8s.io/code-generator/cmd/client-gen
else
	@echo "[tools] client-gen already exists"
endif

.PHONY: install-kind
install-kind:
ifndef KIND_BINARY
	@echo "[tools] downloading kind..."
	@go install sigs.k8s.io/kind
else
	@echo "[tools] kind already exists"
endif
