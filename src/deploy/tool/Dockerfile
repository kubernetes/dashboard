# Copyright 2017 The Kubernetes Dashboard Authors.
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

# Dockerfile used to build tool that helps in deploying Dashboard. Supports Dashboard v1.7+.
# Usage:
#   installation:
#       $ docker run -v /path/to/kubeconfig:/config kubernetesdashboarddev/kd-deploy-helper install
#   removal:
#       $ docker run -v /path/to/kubeconfig:/config kubernetesdashboarddev/kd-deploy-helper remove
#
# In case you want to override default IMAGE_URL execute:
#   $ docker run -v /path/to/kubeconfig_file:/config -e IMAGE_URL=<yaml_file_url> kubernetesdashboarddev/kd-deploy-helper ...
#
# You can also override self-signed certs with your own:
#   $ docker run -v /path/to/kubeconfig:/config -v /path/to/certs_dir:/certs kubernetesdashboarddev/kd-deploy-helper ...
#

FROM ubuntu

ENV IMAGE_URL https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml

# Update cache and install necessary deps
RUN apt-get update && apt-get install -y apt-transport-https curl

# Add pgp key
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
# Add kubernetes source repo
RUN echo 'deb http://apt.kubernetes.io/ kubernetes-xenial main' >> /etc/apt/sources.list.d/kubernetes.list
# Update deps and install kubectl
RUN apt-get update && apt-get install -y kubectl

# Clean cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN echo '#!/bin/bash\n\
    if [ "$1" == "install" ]; then\n\
        echo "Installing Kubernetes Dashboard"\n\
        if [ ! -d /certs ]; then\n\
            mkdir /certs\n\
            echo "Generating self-signed certificates..."\n\
            openssl req -nodes -newkey rsa:2048 -keyout /certs/dashboard.key -out /certs/dashboard.csr -subj "/C=/ST=/L=/O=/OU=/CN=kubernetes-dashboard" &> /dev/null\n\
            openssl x509 -req -sha256 -days 365 -in /certs/dashboard.csr -signkey /certs/dashboard.key -out /certs/dashboard.crt &> /dev/null\n\
            echo "Certificates stored in /certs dir"\n\
        else\n\
            echo "Using provided certificate files"\n\
        fi\n\
        kubectl --kubeconfig /config -n kube-system create secret generic kubernetes-dashboard-certs --from-file=/certs\n\
        kubectl --kubeconfig /config apply -f $IMAGE_URL\n\
    elif [ "$1" == "remove" ]; then\n\
        echo "Removing Kubernetes Dashboard from cluster"\n\
        kubectl --kubeconfig /config -n kube-system delete secret kubernetes-dashboard-certs\n\
        kubectl --kubeconfig /config delete -f $IMAGE_URL\n\
    else\n\
        echo "Missing argument. Please provide \"install\" to install Kubernetes Dashboard or \"remove\" to remove it from cluster."\n\
    fi\n' >> /bootstrap.sh

ENTRYPOINT ["/bin/bash", "bootstrap.sh"]
