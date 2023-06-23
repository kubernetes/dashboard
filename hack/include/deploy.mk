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

# Deployment target for the dev version. It is always based
# on latest master branch. Image will be deployed to official
# registries with tag 'latest'.
.PHONY: --deploy-dev
--deploy-dev: APP_VERSION = "latest"
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


.PHONY: --image
--image: APP_VERSION = "latest"
--image: --ensure-variables-set
	echo "Building '$(APP_NAME):$(APP_VERSION)'" ; \
	docker build \
		-f $(DOCKERFILE) \
		-t $(APP_NAME):$(APP_VERSION) \
		$(ROOT_DIRECTORY) ; \
