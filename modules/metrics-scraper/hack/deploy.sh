#!/bin/bash

arch_list=(amd64 arm arm64 ppc64le s390x)
manifest="kubernetesui/metrics-scraper";

# Concat arch_list with ,
platforms=$(IFS=,; echo "${arch_list[*]}")

image_name="${manifest}:${TRAVIS_TAG:="latest"}"

echo "--- docker buildx build --push --platform $platforms --tag $image_name .";
docker buildx build --push --platform ${platforms} --tag ${image_name} .
