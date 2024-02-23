### Application details
APP_NAME := $(PROJECT_NAME)-auth
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/auth

### Dirs and paths
AUTH_DIST_DIRECTORY = $(DIST_DIRECTORY)/auth
AUTH_DIST_BINARY = $(AUTH_DIST_DIRECTORY)/$(OS)/$(ARCH)/$(APP_NAME)
COVERAGE_FILE = $(AUTH_DIRECTORY)/coverage.out

### Auth Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
