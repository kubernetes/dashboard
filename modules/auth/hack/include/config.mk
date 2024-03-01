### Application details
APP_NAME := $(PROJECT_NAME)-auth
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/auth

### Dirs and paths
AUTH_DIST_DIRECTORY = $(AUTH_DIRECTORY)/.dist
AUTH_DIST_BINARY = $(AUTH_DIST_DIRECTORY)/$(APP_NAME)
COVERAGE_FILE = $(TMP_DIRECTORY)/$(APP_NAME).coverage.out

### Auth Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
