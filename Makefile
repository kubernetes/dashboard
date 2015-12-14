WD=$(shell pwd)

build-docker:
	cp build/Dockerfile .
	docker build -t dashboard-builder .
	docker run --name dashboard-builder -t dashboard-builder gulp build
	docker cp dashboard-builder:/src/dist $(WD)/dist
	docker rm dashboard-builder
	rm -f $(WD)/Dockerfile

image-docker:
	cp src/app/deploy/Dockerfile $(WD)/dist/
	docker build --rm=true --tag kubernetes/dashboard $(WD)/dist/

clean-docker:
	docker rmi dashboard-builder
	rm -rf $(WD)/dist
