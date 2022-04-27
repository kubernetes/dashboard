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

# Import config.
ROOT_DIR="$(cd $(dirname "${BASH_SOURCE}")/../.. && pwd -P)"
. "${ROOT_DIR}/aio/scripts/conf.sh"

# Declare variables.
HELM_CHART_DIR="$AIO_DIR/deploy/helm-chart/kubernetes-dashboard"

function release-helm-chart {
  if [ -n "$(git status --porcelain)" ]; then
    saye "\nGit working tree not clean, aborting."
    exit 1
  fi
  say "\nGenerating Helm Chart package for new version."
  say "Please note that your gh-pages branch, if it locally exists, should be up-to-date."
  helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/
  cd "$HELM_CHART_DIR"
  helm dependency build .
  helm package .
  rm -rf "./charts/"
  say "\nSwitching git branch to gh-pages so that we can commit package along the previous versions."
  git checkout gh-pages
  say "\nGenerating new Helm index, containing all existing versions in gh-pages (previous ones + new one)."
  helm repo index . --merge $ROOT_DIR/index.yaml
  mv index.yaml $ROOT_DIR/index.yaml
  mv kubernetes-dashboard-*.tgz $ROOT_DIR
  cd $OLDPWD
  say "\nCommit new package and index."
  git add -A "./kubernetes-dashboard-*.tgz" ./index.yaml && git commit -m "Update Helm repository from CI."
  say "\nIf you are happy with the changes, please manually push to the gh-pages branch. No force should be needed."
  say "Assuming upstream is your remote, please run: git push upstream gh-pages."
}

# Execute script.
release-helm-chart
