# Docker for Dashboard

This document describes how to run Dashboard out of your kubernetes cluster by useing Docker.  It is simple and  intuitively clear for beginer.

## Docker images

Visit [Docker Hub](https://hub.docker.com/r/kubernetesui/dashboard) to see all available images and tags.

## Usage

Firstly, You can get the *kubeconfig* file in $HOME/.kube directory of your node.

### `docker run`

Then run the following command to start a container:
```sh
sh aio/deploy/docker/deploy_container.sh
```

Now you can visit the dashboard by url: https://<your_ip>:8443 .

###  `docker-compose`

And you can also deploy it using Docker Compose. 

```sh
version: "3"
services:
  dashboard:
    restart: always
    image: kubernetesui/dashboard:latest
    volumes:
      - ~/.kube/config:/home/user/.kube/config
    ports:
      - 8080:9090
      - 8443:8443
    environment:
      - K8S_DASHBOARD_KUBECONFIG=/home/user/.kube/config
      - K8S_OWN_CLUSTER=false
    entrypoint:
      - /dashboard
      - --insecure-bind-address=0.0.0.0
      - --bind-address=0.0.0.0
      - --kubeconfig=/home/user/.kube/config
      - --enable-insecure-login=false
      - --auto-generate-certificates
      - --enable-skip-login=false
```
