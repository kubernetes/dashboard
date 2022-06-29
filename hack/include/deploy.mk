IMAGE := $(IMAGE_REPOSITORY)/$(APP_NAME)

.PHONY: deploy
deploy: --docker-buildx
	docker manifest create --amend $(IMAGE):$(APP_VERSION) $(IMAGE_NAMES) ; \
  docker manifest create --amend $(IMAGE):latest $(IMAGE_NAMES_LATEST) ; \
  docker manifest push $(IMAGE):$(RELEASE_VERSION) ; \
  docker manifest push $(IMAGE):latest

.PHONY: --docker-buildx
--docker-buildx: build-cross
	@for ARCH in $(ARCHITECTURES) ; do \
		docker buildx build \
			-t $(IMAGE)-$$ARCH:$(APP_VERSION) \
			-t $(IMAGE)-$$ARCH:latest \
			--platform linux/$$ARCH \
			--push \
			$(SERVE_DIRECTORY)/$$ARCH ; \
	done ; \

