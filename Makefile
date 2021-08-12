SHELL=/bin/bash
RELEASE_IMAGE=kubernetesui/dashboard
RELEASE_VERSION=v2.3.1
HEAD_IMAGE=kubernetesdashboarddev/dashboard
HEAD_VERSION=head
ARCHITECTURES=amd64 arm64 arm ppc64le s390x

export GOOS?=linux

clean:
	rm -rf .go_workspace .tmp coverage dist npm-debug.log

build-cross: clean
	./aio/scripts/build.sh -c

docker-build-release: build-cross
	for ARCH in $(ARCHITECTURES) ; do \
  		docker build --rm=true --tag $(RELEASE_IMAGE)-$$ARCH:$(RELEASE_VERSION) dist/$$ARCH ; \
  		docker build --rm=true --tag $(RELEASE_IMAGE)-$$ARCH:latest dist/$$ARCH ; \
  done

docker-push-release: docker-build-release
	for ARCH in $(ARCHITECTURES) ; do \
  		docker push $(RELEASE_IMAGE)-$$ARCH:$(RELEASE_VERSION) ; \
  done

docker-build-head: build-cross
	for ARCH in $(ARCHITECTURES) ; do \
  		docker build --rm=true --tag $(HEAD_IMAGE)-$$ARCH:$(HEAD_VERSION) dist/$$ARCH ; \
  done
