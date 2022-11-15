### Application details
APP_NAME := $(PROJECT_NAME)-web
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/web

### Dirs and paths
WEB_DIST_DIRECTORY = $(DIST_DIRECTORY)/web
WEB_DIST_ANGULAR_DIRECTORY = $(WEB_DIST_DIRECTORY)/angular
WEB_DIST_BINARY = $(SERVE_DIRECTORY)/$(OS)/$(ARCH)/$(APP_NAME)

# Angular Serve Arguments
PROXY_CONFIG ?= proxy.conf.json
SSL_ENABLED ?= false

# Web UI Arguments (overridable)
SYSTEM_BANNER ?= "Local test environment"
SYSTEM_BANNER_SEVERITY ?= INFO
AUTO_GENERATE_CERTIFICATES ?= false
