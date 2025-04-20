# Make sure to update versions to whatever the latest is

# DO NOT CHANGE THIS! KEEP IT AT XIV ELSE YOU CAN'T PUSH
EXTENSION_IMAGE?=docketeerxiv/docketeer-extension

# ONLY CHANGE THIS VERSION TO YOUR GROUP | ex: 18.0.0 or 19.0.0 so on
VERSION?=19.0.1

DEV_EXTENSION_NAME=docketeer-extension-dev
DOCKERFILEDIRECTORY=extension
BUILDER=buildx-multi-arch
VITE_DEV_PORT=4000

INFO_COLOR = \033[0;36m
NO_COLOR   = \033[m

# DELETE ALL DOCKETEER RELATED - Images, Volumes, Containers (should be removed from 'make browser-down')
# Start Sever WITHOUT CACHE!
browser-new:
	docker compose -f extension/docker-compose-browser.yaml up --build -d

browser-new-dep:
	docker compose -f extension/docker-compose-browser-dependencies.yaml up --build -d

# RECOMMENDED
browser-dev:
	docker compose -f ${DOCKERFILEDIRECTORY}/docker-compose-browser.yaml up -d

browser-down:
	docker compose -f ${DOCKERFILEDIRECTORY}/docker-compose-browser.yaml down

# Check Progress on Debug Extension
extension-dev: build-extension-dev install-extension-dev dev-tools

build-extension-dev:
	docker build -t ${DEV_EXTENSION_NAME} -f ${DOCKERFILEDIRECTORY}/dockerfile.dev .

install-extension-dev:
	docker extension install ${DEV_EXTENSION_NAME} -f

dev-tools:
	docker extension dev debug ${DEV_EXTENSION_NAME}
	docker extension dev ui-source ${DEV_EXTENSION_NAME} http://localhost:${VITE_DEV_PORT}

# NOTES: This will delete EVERYTHING not just Docketeer related files!
pruneAll: 
	docker system prune --all --force --volumes

#use rarely
hardclean: 
	img_prune clr_cache

# Remove Debug Extension
remove-dev-extension:
	docker extension rm ${DEV_EXTENSION_NAME}
	
img_prune:
	docker image prune -af

clr_cache:
	docker buildx prune -f 

reload: 
	build-dev update dev-tools

update: 
	docker extension update docketeer-extension

prod: install-prod debug-prod

build-prod: ## Build service image to be deployed as a desktop extension
	docker build --tag=$(EXTENSION_IMAGE):$(VERSION) -f ${DOCKERFILEDIRECTORY}/dockerfile.prod .

install-prod: build-prod ## Install the extension
	docker extension install $(EXTENSION_IMAGE):$(VERSION) -f

update-prod: build-prod ## Update the extension
	docker extension update $(EXTENSION_IMAGE):$(VERSION) -f

debug-prod: # Update the extension and put it into debug mode
	docker extension dev debug $(EXTENSION_IMAGE):$(VERSION)

validate-prod: install-prod## Make sure you have the multiplatform image created, need it to made to pass this
	docker extension validate $(EXTENSION_IMAGE):$(VERSION)

prepare-buildx: ## Create buildx builder for multi-arch build, if not exists
	docker buildx inspect $(BUILDER) || docker buildx create --name=$(BUILDER) --driver=docker-container --driver-opt=network=host

# added a new makefile target to make dev experience simpler
remake-extension-dev:
	$(MAKE) remove-dev-extension extension-dev

## DEPLOYMENT: type 'make help' and follow every single step before pushing up with 'make push-extension'
## NOTE: validate-prod and prepare-buildx may fail during deployment steps. If so, ignore and move on to next steps in the 'make help' process

## Pushing one image will push all the others it references in the chain. push-extension will push everything to docker hub
## NOTE: Pushing may take time (> 5 min). To verify push, login to docker hub with docketeer account. New docketeer extension version will take time to become available on Docker Desktop (~1-24 hours)
push-extension: prepare-buildx## Build & Upload extension image to hub. Do not push if VERSION already exists: make push-extension VERSION=0.1
	docker pull $(EXTENSION_IMAGE):$(VERSION) && echo "Failure: Tag already exists" || docker buildx build --push --builder=$(BUILDER) --platform=linux/amd64,linux/arm64 --build-arg TAG=$(VERSION) --tag=$(EXTENSION_IMAGE):$(VERSION) -f ${DOCKERFILEDIRECTORY}/dockerfile.prod .

help: ## Show this help
	@echo Please specify a build target. The choices are:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(INFO_COLOR)%-30s$(NO_COLOR) %s\n", $$1, $$2}'

.PHONY: help