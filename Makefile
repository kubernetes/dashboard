# Makefile to build docker image

# docker container image tags
docker_group := ammeon
docker_image := kubernetes-helm-dashboard-amd64
docker_ver   := 0.0.6
docker_tag   := $(docker_group)/$(docker_image):$(docker_ver)
canary_tag   := gcr.io/google_containers/kubernetes-dashboard-amd64:canary

# other options
build_image := "kubernetes-dashboard-build-image"
gulp_cmd    := node_modules/.bin/gulp
dir         := $(shell pwd)
dk          := sudo docker
dk_run      := $(dk) run \
				-it \
				--rm \
				--net=host \
				-v /var/run/docker.sock:/var/run/docker.sock \
				-v $(dir)/src:/dashboard/src \
				-v $(dir)/vendor/:/dashboard/vendor/ \
				$(build_image)

.PHONY: all build build-builder build-image tag-image push-image serve

# Build builder image, Build dashboard image and Push to docker hub
all: build-builder build-image tag-image push-image

# Build dashboard image and Push to docker hub
build: build-image tag-image push-image

# Build builder image
build-builder:
	$(dk) build -t $(build_image) -f $(dir)/build/Dockerfile $(dir)

# Run 'bash' in dashboard builder image
bash:
	$(dk_run) bash

# Build dashboard image
build-image:
	$(dk_run) $(gulp_cmd) docker-image:canary

# Tag dashboard image
tag-image:
	$(dk) tag $(canary_tag) $(docker_tag)

# Push dashboard image
push-image:
	$(dk) push $(docker_tag)

# Serve dashboard locally
serve:
	ps aux | grep "kubectl proxy" | grep -v "grep" | cut -d " " -f3 | xargs -r kill -9
	kubectl proxy --port=8080 &
	$(dk_run) $(gulp_cmd) serve
