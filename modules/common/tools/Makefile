LICENSE_EYE_BINARY := $(shell which license-eye)
AIR_BINARY := $(shell which air)
GOLANGCI_LINT_BINARY := $(shell which golangci-lint)
CLIENT_GEN_BINARY := $(shell which client-gen)

GO_BINARY := $(shell which go)
GO_MAJOR_VERSION = $(shell go version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f1)
GO_MINOR_VERSION = $(shell go version | cut -c 14- | cut -d' ' -f1 | cut -d'.' -f2)
MIN_GO_MAJOR_VERSION = 1
MIN_GO_MINOR_VERSION = 19

NODE_BINARY := $(shell which node)
NODE_MAJOR_VERSION = $(shell node --version | cut -d'.' -f1 | cut -d'v' -f2 )
NODE_MINOR_VERSION = $(shell npm --version | cut -d'.' -f2)
MIN_NODE_MAJOR_VERSION = 16
MIN_NODE_MINOR_VERSION = 14
YARN_BINARY := $(shell which yarn)

# TODO: It should check not only if binaries are installed but also their versions

.PHONY: install
install: ensure-go ensure-node install-license-eye install-air install-golangci-lint install-client-gen install-yarn

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

.PHONY: ensure-node
ensure-node:
ifndef NODE_BINARY
	$(error "Cannot find npm binary")
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

.PHONY: install-client-gen
install-client-gen:
ifndef CLIENT_GEN_BINARY
	@echo "[tools] downloading client-gen..."
	@go install k8s.io/code-generator/cmd/client-gen
else
	@echo "[tools] client-gen already exists"
endif

.PHONY: install-yarn
install-yarn:
ifndef YARN_BINARY
	@echo "[tools] downloading yarn..."
	@npm install yarn
else
	@echo "[tools] yarn already exists"
endif
