# Copyright 2017 The Kubernetes Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Main Dockerfile of the project. It creates an image that serves the application. This image should
# be built from the dist directory.

# Scratch can be used as the base image because the backend is compiled to include all
# its dependencies.
FROM scratch
LABEL maintainer "Piotr Bryk <bryk@google.com>"

# Add all files from current working directory to the root of the image, i.e., copy dist directory
# layout to the root directory.
ADD . /

# The port that the application listens on.
# TODO(bryk): Parametrize this argument so that other build tools are aware of the exposed port.
EXPOSE 9090 8443
ENTRYPOINT ["/dashboard", "--insecure-bind-address=0.0.0.0", "--bind-address=0.0.0.0"]
