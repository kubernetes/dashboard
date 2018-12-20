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

import namespaceModule from 'common/namespace/module';

describe('Namespace service', () => {
  /** @type {!common/namespace/service.NamespaceService} */
  let namespaceService;
  /** @type {!chrome/state.StateParams} */
  let stateParams;

  beforeEach(() => angular.mock.module(namespaceModule.name));

  beforeEach(angular.mock.inject((kdNamespaceService, $stateParams) => {
    namespaceService = kdNamespaceService;
    stateParams = $stateParams;
  }));

  it(`should default true`, () => {
    expect(namespaceService.areMultipleNamespacesSelected()).toBe(false);
  });

  it(`should use many namespaces param`, () => {
    stateParams.namespace = '_all';
    expect(namespaceService.areMultipleNamespacesSelected()).toBe(true);
  });

  it(`should use namespace param`, () => {
    stateParams.namespace = 'foo';
    expect(namespaceService.areMultipleNamespacesSelected()).toBe(false);
  });
});
