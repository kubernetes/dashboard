### Application details
APP_NAME := $(PROJECT_NAME)-api
PACKAGE_NAME := k8s.io/$(PROJECT_NAME)/api

### Dirs and paths
API_DIST_DIRECTORY = $(API_DIRECTORY)/.dist
API_DIST_BINARY = $(API_DIST_DIRECTORY)/$(APP_NAME)
COVERAGE_FILE = $(TMP_DIRECTORY)/$(APP_NAME).coverage.out
SCHEMA_DIRECTORY = $(API_DIRECTORY)/schema

### Codegen configuration
INPUT = "apis/v1alpha1"
CLIENTSET_NAME = clientset
OUTPUT_BASE = $(BASE_DIR)
OUTPUT_PACKAGE = $(INPUT_BASE)/client
VERIFY_ONLY = false
CODEGEN_EXTRA_ARGS = ""

### API Arguments (overridable)
KUBECONFIG ?= $(HOME)/.kube/config
SIDECAR_HOST ?= http://scraper:8000
AUTO_GENERATE_CERTIFICATES ?= false
BIND_ADDRESS ?= 127.0.0.1
PORT ?= 8000
