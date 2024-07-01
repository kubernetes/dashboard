#!/bin/bash
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

# Inform how to add full access role for development
# and get token for logging in to dashboard 
echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ CAUTION!! @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
echo "DO NOT USE THIS IN OPEN NETWORK!"
echo ""
echo "To add a role with full access for development and get its token"
echo "to log into the Dashboard, see followings:"
echo ""
echo "1. Run terminal in development container."
echo "    docker exec -it k8s-dashboard-dev gosu user bash"
echo ""
echo "2. Set env for kubeconfig on development container."
echo "    export KUBECONFIG=/go/src/github.com/kubernetes/dashboard/.tmp/kubeconfig"
echo ""
echo "3. Add full access role for development."
echo "    kubectl apply -f hack/develop/developmental-role.yaml"
echo ""
echo "4. Run following to get token for logging into dashboard."
echo "    kubectl -n kubernetes-dashboard create token kubernetes-dashboard"
echo ""
echo "5. Access https://localhost:8443/ with browser on your host,"
echo "   then login with token."
echo ""
echo "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"

# Start dashboard.
echo "Start dashboard in production mode"
make run
