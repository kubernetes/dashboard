#!/bin/bash

IMAGE_NAME=fest/kubernetes-dashboard
DIST_DIRECTORY=dist/

#build dashboard
#gulp build

#build docker image and push to docker hub
cp Dockerfile $DIST_DIRECTORY
docker build --rm=true --tag $IMAGE_NAME $DIST_DIRECTORY && docker push $IMAGE_NAME
