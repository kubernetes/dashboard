#!/usr/bin/env bash
# Copyright 2017 The Kubernetes Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script takes an argument: the tag name ("v1.2.3") to release from.

# Exit on error.
set -e

# Declare variables.
UPSTREAM_REPOSITORY_NAME="upstream"
TAG="$1"

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/aio/scripts/conf.sh"

function release-helm-chart {
  if [ -z "$TAG" ]; then
    saye "\nPlease specify tag (like v1.2.3) as first and only argument."
    exit 1
  fi
  if [ -n "$(git status --porcelain)" ]; then
    saye "\nGit working tree not clean, aborting."
    exit 1
  fi
  say "\nChanging current branch to $TAG."
  git checkout "$TAG"
  say "\nGenerating Helm Chart package for new version."
  helm repo add stable https://kubernetes-charts.storage.googleapis.com/
  helm dependency build "$AIO_DIR/deploy/helm-chart/kubernetes-dashboard"
  helm package "$AIO_DIR/deploy/helm-chart/kubernetes-dashboard"
  say "\nSwitching git branch to gh-pages so that we can commit package along the previous versions."
  git checkout gh-pages
  say "\nGenerating new Helm index, containing all existing versions in gh-pages (previous ones + new one)."
  helm repo index .
  say "\nCommit new package and index."
  git add -A "./kubernetes-dashboard-*.tgz" ./index.yaml && git commit -m "Update Helm repository from CI."
  say "\nPush the gh-pages branch (no force)."
  git push $UPSTREAM_REPOSITORY_NAME gh-pages
}

# Execute script.
release-helm-chart
