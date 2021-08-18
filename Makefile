SHELL=/bin/bash
RELEASE_IMAGE=kubernetesui/dashboard
RELEASE_VERSION=v2.3.1
RELEASE_IMAGE_NAMES+=$(foreach arch, $(ARCHITECTURES), $(RELEASE_IMAGE)-$(arch):$(RELEASE_VERSION))
HEAD_IMAGE=kubernetesdashboarddev/dashboard
HEAD_VERSION=head
HEAD_IMAGE_NAMES+=$(foreach arch, $(ARCHITECTURES), $(HEAD_IMAGE)-$(arch):$(HEAD_VERSION))
ARCHITECTURES=amd64 arm64 arm ppc64le s390x

export GOOS?=linux

.PHONY: clean
clean:
	rm -rf .go_workspace .tmp coverage dist npm-debug.log

.PHONY: build-cross
build-cross: clean
	./aio/scripts/build.sh -c

.PHONY: docker-build-release
docker-build-release: build-cross
	for ARCH in $(ARCHITECTURES) ; do \
  		docker build --rm=true -t $(RELEASE_IMAGE)-$$ARCH:$(RELEASE_VERSION) -t $(RELEASE_IMAGE)-$$ARCH:latest dist/$$ARCH ; \
  done

.PHONY: docker-push-release
docker-push-release: docker-build-release
	for ARCH in $(ARCHITECTURES) ; do \
  		docker push $(RELEASE_IMAGE)-$$ARCH:$(RELEASE_VERSION) ; \
  done ; \
  docker manifest create --amend $(RELEASE_IMAGE):$(RELEASE_VERSION) $(RELEASE_IMAGE_NAMES)
	for ARCH in $(ARCHITECTURES) ; do \
  		docker manifest annotate $(RELEASE_IMAGE):$(RELEASE_VERSION) $(RELEASE_IMAGE)-$$ARCH:$(RELEASE_VERSION) --os linux --arch $$ARCH ; \
  done ; \
  docker manifest push $(RELEASE_IMAGE):$(RELEASE_VERSION)

.PHONY: docker-build-head
docker-build-head: build-cross
	for ARCH in $(ARCHITECTURES) ; do \
  		docker build --rm=true -t $(HEAD_IMAGE)-$$ARCH:$(HEAD_VERSION) dist/$$ARCH ; \
  done

.PHONY: docker-push-head
docker-push-head: docker-build-head
	for ARCH in $(ARCHITECTURES) ; do \
  		docker push $(HEAD_IMAGE)-$$ARCH:$(HEAD_VERSION) ; \
  done ; \
  docker manifest create --amend $(HEAD_IMAGE):$(HEAD_VERSION) $(HEAD_IMAGE_NAMES)
	for ARCH in $(ARCHITECTURES) ; do \
  		docker manifest annotate $(HEAD_IMAGE):$(HEAD_VERSION) $(HEAD_IMAGE)-$$ARCH:$(HEAD_VERSION) --os linux --arch $$ARCH ; \
  done ; \
  docker manifest push $(HEAD_IMAGE):$(HEAD_VERSION)
