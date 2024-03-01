include $(PARTIALS_DIRECTORY)/config.mk

.PHONY: --ensure-kind-cluster
--ensure-kind-cluster:
  # TODO: Check if existing cluster has KIND_CLUSTER_NAME.
	@if test -n "$(shell kind get clusters 2>/dev/null)"; then \
  	echo [kind] cluster already exists; \
  else \
    echo [kind] creating cluster $(KIND_CLUSTER_NAME); \
    kind create cluster -q --name $(KIND_CLUSTER_NAME) --image=$(KIND_CLUSTER_IMAGE); \
  fi; \
  echo [kind] exporting internal kubeconfig to $(TMP_DIRECTORY); \
  mkdir -p $(TMP_DIRECTORY); \
  kind get kubeconfig --name $(KIND_CLUSTER_NAME) --internal > $(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH)

.PHONY: --kind-load-images
--kind-load-images:
	@echo Loading dashboard-auth:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-auth:latest
	@echo Loading dashboard-api:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-api:latest
	@echo Loading dashboard-web:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-web:latest
	@echo Loading dashboard-scraper:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-scraper:latest
