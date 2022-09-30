# TODO:
# 	- Adjust cross build to build for linux and darwin supported architectures accordingly

# Deployment target for the official version
# Usage:
# 	- `make deploy` - deploys both latest and tagged version
#   - `make deploy APP_VERSION="latest"` - deploys only the latest version
#		- `make deploy APP_VERSION="xyz"` - deploys both latest and provided version
.PHONY: --deploy
--deploy: --ensure-variables-set
	@VERSIONS="latest $(APP_VERSION)" ; \
	if [ "$(APP_VERSION)" = "latest" ] ; then \
	  VERSIONS="latest" ; \
	fi ; \
	for REGISTRY in $(IMAGE_REGISTRIES) ; do \
  	for VERSION in $${VERSIONS} ; do \
  		echo "Deploying '$(APP_NAME):$${VERSION}' to the '$${REGISTRY}/$(IMAGE_REPOSITORY)' registry" ; \
			docker buildx build \
				-f $(DOCKERFILE) \
				-t $${REGISTRY}/$(IMAGE_REPOSITORY)/$(APP_NAME):$${VERSION} \
				--platform $(BUILDX_ARCHITECTURES) \
				--push \
				$(ROOT_DIRECTORY) ; \
  	done ; \
  done

# Deployment target for the dev version
# Image will be always deployed to our static dev registry at:
# 	docker.io/kubernetesdashboarddev/dashboard:latest
.PHONY: --deploy-dev
--deploy-dev: IMAGE_REGISTRIES = "docker.io"# Dev registry
--deploy-dev: IMAGE_REPOSITORY = "kubernetesdashboarddev"# Dev repository
--deploy-dev: APP_VERSION = "latest"# Dev repository
--deploy-dev: --deploy

.PHONY: --ensure-variables-set
--ensure-variables-set:
	@if [ -z "$(DOCKERFILE)" ]; then \
  	echo "DOCKERFILE variable not set" ; \
  	exit 1 ; \
  fi ; \
	if [ -z "$(APP_NAME)" ]; then \
		echo "APP_NAME variable not set" ; \
		exit 1 ; \
	fi ; \
