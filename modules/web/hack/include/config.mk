### Application details
APP_NAME := $(PROJECT_NAME)-web
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/web

### Dirs and paths
WEB_DIST_DIRECTORY = $(WEB_DIRECTORY)/dist
WEB_DIST_ANGULAR_DIRECTORY = $(WEB_DIST_DIRECTORY)/public
WEB_TMP_DIRECTORY = $(WEB_DIRECTORY)/.tmp
COVERAGE_FILE = $(WEB_TMP_DIRECTORY)/coverage.out

# Angular Serve Arguments
PROXY_CONFIG ?= proxy.conf.json
SSL_ENABLED ?= false

# Web UI Arguments (overridable)
SYSTEM_BANNER ?= "Local test environment"
SYSTEM_BANNER_SEVERITY ?= INFO
AUTO_GENERATE_CERTIFICATES ?= false
BIND_ADDRESS ?= 127.0.0.1
