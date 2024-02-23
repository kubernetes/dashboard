### Application details
APP_NAME := $(PROJECT_NAME)-auth
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/auth

### Dirs and paths
AUTH_DIST_DIRECTORY = $(AUTH_DIRECTORY)/dist
AUTH_DIST_BINARY = $(AUTH_DIST_DIRECTORY)/$(APP_NAME)
AUTH_TMP_DIRECTORY = $(AUTH_DIRECTORY)/.tmp
COVERAGE_FILE = $(AUTH_TMP_DIRECTORY)/coverage.out

### Auth Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
