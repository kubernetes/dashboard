ROOT_DIRECTORY = $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))/../..

include $(ROOT_DIRECTORY)/hack/include/config.mk
include $(ROOT_DIRECTORY)/hack/include/build.mk

include hack/include/config.mk

include $(ROOT_DIRECTORY)/hack/include/deploy.mk

# List of targets that should be executed before other targets
PRE := --ensure-dist-exists

.PHONY: codegen-update
codegen-update: --codegen-update-run --codegen-update-post

.PHONY: codegen-verify
codegen-verify: VERIFY_ONLY = true
codegen-verify: --codegen-verify-pre --codegen-update-run --codegen-verify-post

.PHONY: build
build: ARCHITECTURES = $(OS)/$(ARCH)
build: build-cross

.PHONY: build-cross
build-cross: $(PRE)
	@for ARCH in $(ARCHITECTURES) ; do \
  	os=$${ARCH%/*} ; \
  	arch=$${ARCH#*/} ; \
  	echo "Building dashboard-api for $$os/$$arch" ; \
  	CGO_ENABLED=0 GOOS=$$os GOARCH=$$arch go build -ldflags "-X $(PACKAGE_NAME)/client.Version=$(RELEASE_VERSION)" -gcflags="all=-N -l" -o $(API_DIST_DIRECTORY)/$$ARCH/$(APP_NAME) $(PACKAGE_NAME) ; \
  done

.PHONY: run
run: build
	@$(API_DIST_BINARY) --kubeconfig=$(KUBECONFIG) \
		--sidecar-host=$(SIDECAR_HOST) \
		--token-ttl=$(TOKEN_TTL) \
		--auto-generate-certificates=$(AUTO_GENERATE_CERTIFICATES) \
		--enable-insecure-login=$(ENABLE_INSECURE_LOGIN) \
		--enable-skip-login=$(ENABLE_SKIP_LOGIN)

.PHONY: run-air
run-air:
	@$(API_DIST_BINARY) --kubeconfig=$(KUBECONFIG) \
		--sidecar-host=localhost:9001 \
		--token-ttl=$(TOKEN_TTL) \
		--auto-generate-certificates=$(AUTO_GENERATE_CERTIFICATES) \
		--enable-insecure-login=$(ENABLE_INSECURE_LOGIN) \
		--enable-skip-login=$(ENABLE_SKIP_LOGIN)

.PHONY: serve
serve: $(PRE)
	@air

.PHONY: serve-https
serve-https:
	AUTO_GENERATE_CERTS=true $(MAKE) serve

.PHONY: test
test:
	go test $(PACKAGE_NAME)/...

.PHONY: coverage
coverage:
	go test -coverprofile=$(COVERAGE_FILE) -covermode=atomic $(PACKAGE_NAME)/...

.PHONY: deploy
deploy: DOCKERFILE = $(API_DIRECTORY)/Dockerfile
deploy: --deploy

.PHONY: deploy-dev
deploy-dev: DOCKERFILE = $(API_DIRECTORY)/Dockerfile
deploy-dev: --deploy-dev

.PHONY: --ensure-dist-exists
--ensure-dist-exists:
	@mkdir -p $(API_DIST_DIRECTORY)

.PHONY: --codegen-update-run
--codegen-update-run:
	@${GOPATH}/bin/client-gen \
  	--input-base=$(INPUT_BASE) \
  	--input=$(INPUT) \
  	--clientset-name=$(CLIENTSET_NAME) \
  	--output-base=$(OUTPUT_BASE) \
  	--output-package=$(OUTPUT_PACKAGE) \
  	--verify-only=$(VERIFY_ONLY) \
  	$(CODEGEN_EXTRA_ARGS)

.PHONY: --codegen-update-post
--codegen-update-post:
	@rm -rf $(BASE_DIR)/client
	@mv $(BASE_DIR)/$(OUTPUT_PACKAGE) $(BASE_DIR)
	@rm -rf $(BASE_DIR)/k8s.io

.PHONY: --codegen-verify-pre
--codegen-verify-pre:
	@mkdir -p $(BASE_DIR)/$(OUTPUT_PACKAGE)
	@cp -r $(BASE_DIR)/client $(BASE_DIR)/$(INPUT_BASE)

.PHONY: --codegen-verify-post
--codegen-verify-post:
	@rm -rf $(BASE_DIR)/k8s.io
