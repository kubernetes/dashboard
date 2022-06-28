### Application details
APP_NAME := dashboard-web
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/dashboard/web
# Docker image details
IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(IMAGE_REPOSITORY)/$(APP_NAME)-$(arch):$(APP_VERSION))
# Images versioned as latest are build based on the master branch
IMAGE_NAMES_LATEST += $(foreach arch, $(ARCHITECTURES), $(IMAGE_REPOSITORY)/$(APP_NAME)-$(arch):latest)

### Dirs and paths
SERVE_DIRECTORY = $(DIST_DIRECTORY)/web
SERVE_BINARY = $(SERVE_DIRECTORY)/$(ARCH)/$(APP_NAME)

# Web UI Arguments (overridable)
SYSTEM_BANNER ?= "Local test environment"
SYSTEM_BANNER_SEVERITY ?= INFO
AUTO_GENERATE_CERTIFICATES ?= false
