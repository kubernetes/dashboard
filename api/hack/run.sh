#!/usr/bin/env bash

set -euo pipefail

KUBECONFIG="${KUBECONFIG:-${HOME}/.kube/config}"
ENABLE_REFLECTION_API="${REFLECTION_API:-false}"

go run github.com/kubernetes/dashboard/pkg/cmd \
  --kubeconfig=${KUBECONFIG} \
  --enable-reflection-api=${ENABLE_REFLECTION_API}
