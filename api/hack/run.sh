#!/usr/bin/env bash

set -euo pipefail

go run github.com/kubernetes/dashboard/pkg/cmd \
  --kubeconfig=${KUBECONFIG:-${HOME}/.kube/config} \
  --port=${PORT:-8080} \
  --bind-address=${BIND_ADDRESS:-127.0.0.1} \
  --sidecar-host=${SIDECAR_HOST:-http://localhost:8000} \
  --enable-reflection-api=${ENABLE_REFLECTION_API:-false}
