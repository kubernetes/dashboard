#!/bin/bash
# Copyright 2015 Google Inc. All Rights Reserved.
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

# This is a script that runs on npm install postinstall phase.
# It contains all prerequisites required to use the build system.

./node_modules/.bin/bower install --allow-root

# Godep is required by the project. Install it in the .tools directory.
GOPATH=`pwd`/.tools/go go get github.com/tools/godep
# XtbGeneator is required by the project. Clone it into .tools.
if ! [ -a "./.tools/xtbgenerator/bin/XtbGenerator.jar" ]
then
  (cd ./.tools/; git clone https://github.com/kuzmisin/xtbgenerator)
fi
