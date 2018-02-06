#!/bin/bash
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

DIR=$(pwd)

# Patch wiredep so we can use it to manage NPM dependencies instead of bower
cd ./node_modules/wiredep
patch -N < ../../build/patch/wiredep/wiredep.patch
cd lib
patch -N < ../../../build/patch/wiredep/detect-dependencies.patch
cd ..
rm lib/*.orig lib/*.rej *.orig *.rej 2> /dev/null

cd ${DIR}

# Govendor is required by the project. Install it in the .tools directory.
GOPATH=`pwd`/.tools/go go get github.com/kardianos/govendor
# XtbGeneator is required by the project. Clone it into .tools.
if ! [ -a "./.tools/xtbgenerator/bin/XtbGenerator.jar" ]
then
  (cd ./.tools/; git clone https://github.com/kuzmisin/xtbgenerator; cd xtbgenerator; git checkout d6a6c9ed0833f461508351a80bc36854bc5509b2)
fi
