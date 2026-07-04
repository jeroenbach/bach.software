ACR_NAME     ?= bachreg
IMAGE_NAME    = bach-software-web
VERSION       = $(shell cat version.txt | tr -d '[:space:]')
BUILD_NUMBER ?= local
IMAGE_TAG     = $(VERSION)-$(BUILD_NUMBER)
FULL_IMAGE    = $(ACR_NAME).azurecr.io/$(IMAGE_NAME)
HELM_CHART    = ../../k8s
NAMESPACE     = bach-software

-include ../../.env
export

.PHONY: build push push-only deploy redeploy rollback uninstall

# Build the Docker image for linux/amd64 (required for AKS) and tag it with both
# the versioned tag (<version>-<BUILD_NUMBER>) and :latest. Uses ACR layer cache.
build:
	docker build \
		--platform linux/amd64 \
		--cache-from $(FULL_IMAGE):latest \
		-t $(FULL_IMAGE):$(IMAGE_TAG) \
		-t $(FULL_IMAGE):latest \
		-f Dockerfile .

# Log in to ACR and push the locally-built image. Skips the Docker build step —
# use this when the image is already built (e.g. after `make build`).
push-only:
	az acr login --name $(ACR_NAME)
	docker push $(FULL_IMAGE):$(IMAGE_TAG)
	docker push $(FULL_IMAGE):latest
	@echo ""
	@echo "Pushed: $(FULL_IMAGE):$(IMAGE_TAG)"

# Build the image locally and push it to ACR.
push: build push-only

# Full pipeline: build → push → Helm deploy.
deploy: push _helm-deploy

# Re-deploy the image that is already in ACR without any local Docker operations.
redeploy: _helm-deploy

# Roll back to a specific image tag already in ACR. Requires TAG to be set.
# Usage: make rollback TAG=1.0.0-42
rollback:
	@test -n "$(TAG)" || (echo "Usage: make rollback TAG=1.0.0-42" && exit 1)
	@$(MAKE) _helm-deploy IMAGE_TAG=$(TAG)

# Remove the Helm release from the cluster. Does not delete images from ACR.
uninstall:
	helm uninstall bach-software-web --namespace $(NAMESPACE) --ignore-not-found

# Internal target — runs helm upgrade --install with all required values.
_helm-deploy:
	@echo "Deploying $(FULL_IMAGE):$(IMAGE_TAG)..."
	helm upgrade --install bach-software-web $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--create-namespace \
		--set image.repository=$(FULL_IMAGE) \
		--set image.tag=$(IMAGE_TAG) \
		--set plausible.apiToken=$(PLAUSIBLE_API_TOKEN) \
		--set plausible.apiUrl=$(PLAUSIBLE_API_URL) \
		--set ingress.host=dev.api.bach.software \
		--wait --timeout 120s
