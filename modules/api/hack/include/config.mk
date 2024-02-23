### Application details
APP_NAME := $(PROJECT_NAME)-api
APP_VERSION := v1.0.0
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/api

### Dirs and paths
API_DIST_DIRECTORY = $(API_DIRECTORY)/dist
API_DIST_BINARY = $(API_DIST_DIRECTORY)/$(APP_NAME)
API_TMP_DIRECTORY = $(API_DIRECTORY)/.tmp
COVERAGE_FILE = $(API_TMP_DIRECTORY)/coverage.out

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
SIDECAR_HOST ?= http://scraper:8000
TOKEN_TTL ?= 0 # Never expire
AUTO_GENERATE_CERTIFICATES ?= false
BIND_ADDRESS ?= 127.0.0.1
PORT ?= 8080
ENABLE_INSECURE_LOGIN ?= false
ENABLE_SKIP_LOGIN ?= true
