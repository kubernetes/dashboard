// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {namespaceParam} from 'chrome/state';
import module from 'common/namespace/module';

describe('Namespace module ', () => {
  beforeEach(() => {
    angular.mock.module(module.name);
  });

  // TODO: rewrite test to work with new state transition hooks
  xit('should watch for changes', angular.mock.inject(($location, $rootScope) => {
    $location.search(namespaceParam, undefined);
    expect($location.search()[namespaceParam]).toBe(undefined);

    $rootScope.$broadcast('$locationChangeSuccess');
    $rootScope.$digest();
    expect($location.search()[namespaceParam]).toBe('default');

    $location.search(namespaceParam, undefined);
    expect($location.search()[namespaceParam]).toBe(undefined);
    $rootScope.$digest();
    expect($location.search()[namespaceParam]).toBe('default');
  }));
});
