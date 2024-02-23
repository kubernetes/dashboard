include $(PARTIALS_DIRECTORY)/config.mk

.PHONY: --ensure-tools
--ensure-tools:
	@$(MAKE) --no-print-directory -C $(TOOLS_DIRECTORY) install

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
