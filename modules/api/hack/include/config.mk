### Application details
APP_NAME := dashboard-api
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/dashboard/api
# Docker image details
IMAGE_NAMES += $(foreach arch, $(ARCHITECTURES), $(IMAGE_REPOSITORY)/$(APP_NAME)-$(arch):$(APP_VERSION))
# Images versioned as latest are build based on the master branch
IMAGE_NAMES_LATEST += $(foreach arch, $(ARCHITECTURES), $(IMAGE_REPOSITORY)/$(APP_NAME)-$(arch):latest)

### Dirs and paths
API_DIST_DIRECTORY = $(DIST_DIRECTORY)/api
API_DIST_BINARY = $(API_DIST_DIRECTORY)/$(ARCH)/$(APP_NAME)
COVERAGE_FILE = $(API_DIRECTORY)/coverage.out

### Codegen configuration
BASE_DIR = $(API_DIRECTORY)/pkg/plugin
INPUT_BASE = $(PACKAGE_NAME)/pkg/plugin
INPUT = "apis/v1alpha1"
CLIENTSET_NAME = clientset
OUTPUT_BASE = $(BASE_DIR)
OUTPUT_PACKAGE = $(INPUT_BASE)/client
VERIFY_ONLY = false
CODEGEN_EXTRA_ARGS = ""

### API Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
SIDECAR_HOST ?= http://sidecar:8000
TOKEN_TTL ?= 0 # Never expire
AUTO_GENERATE_CERTIFICATES ?= false
BIND_ADDRESS ?= 127.0.0.1
PORT ?= 8080
ENABLE_INSECURE_LOGIN ?= false
ENABLE_SKIP_LOGIN ?= true
