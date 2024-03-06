include $(PARTIALS_DIRECTORY)/config.mk

.PHONY: --ensure-kind-cluster
--ensure-kind-cluster:
	@if test -n "$(shell kind get clusters 2>/dev/null | grep $(KIND_CLUSTER_NAME))"; then \
  	echo [kind] cluster already exists; \
  else \
    echo [kind] creating cluster $(KIND_CLUSTER_NAME); \
    kind create cluster -q --config=$(KIND_CONFIG_FILE) --name=$(KIND_CLUSTER_NAME) --image=$(KIND_CLUSTER_IMAGE); \
  fi; \
  echo [kind] exporting internal kubeconfig to $(TMP_DIRECTORY); \
  mkdir -p $(TMP_DIRECTORY); \
  kind get kubeconfig --name $(KIND_CLUSTER_NAME) --internal > $(KIND_CLUSTER_INTERNAL_KUBECONFIG_PATH)

.PHONY: --ensure-metrics-server
--ensure-metrics-server:
	@echo [kind] installing metrics server $(METRICS_SERVER_VERSION)
	@kubectl --context $(KIND_CLUSTER_KUBECONFIG_CONTEXT) apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/$(METRICS_SERVER_VERSION)/components.yaml >/dev/null
	@echo [kind] patching metrics server arguments
	@kubectl patch deployment \
		metrics-server \
		--context $(KIND_CLUSTER_KUBECONFIG_CONTEXT) \
		-n kube-system \
		--type='json' \
		-p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": ["--cert-dir=/tmp", "--secure-port=10250", "--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname", "--kubelet-use-node-status-port", "--metric-resolution=15s", "--kubelet-insecure-tls"]}]'

.PHONY: --ensure-kind-ingress-nginx
--ensure-kind-ingress-nginx:
	@echo [kind] installing ingress-nginx
	@kubectl --context $(KIND_CLUSTER_KUBECONFIG_CONTEXT) apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-$(INGRESS_NGINX_VERSION)/deploy/static/provider/kind/deploy.yaml >/dev/null
	@kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission >/dev/null

.PHONY: --ensure-helm-dependencies
--ensure-helm-dependencies:
	@echo [helm] updating helm dependencies
	@helm dependency update $(CHART_DIRECTORY) >/dev/null

.PHONY: --kind-load-images
--kind-load-images:
	@echo Loading dashboard-auth:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-auth:latest >/dev/null
	@echo Loading dashboard-api:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-api:latest >/dev/null
	@echo Loading dashboard-web:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-web:latest >/dev/null
	@echo Loading dashboard-scraper:latest into kind cluster
	@kind load docker-image -n $(KIND_CLUSTER_NAME) dashboard-scraper:latest >/dev/null
