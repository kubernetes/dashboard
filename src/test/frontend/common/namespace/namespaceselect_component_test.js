// Copyright 2015 Google Inc. All Rights Reserved.
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

import module from 'common/namespace/namespace_module';
import chromeModule from 'chrome/chrome_module';
import {StateParams} from 'chrome/chrome_state';

describe('Namespace select component ', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!common/namespace/namespaceselect_component.NamespaceSelectController} */
  let ctrl;
  /** @type {!common/namespace/namespace_service.NamespaceService} */
  let service;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => {
    let fakeModule = angular.module('fakeModule', ['ui.router']);
    fakeModule.config(($stateProvider) => {
      $stateProvider.state('fakeState', {
        url: 'fakeStateUrl',
        parent: 'chrome',
        template: '<ui-view>Foo</ui-view>',
      });
    });
    angular.mock.module(module.name);
    angular.mock.module(fakeModule.name);
    angular.mock.module(chromeModule.name);

    angular.mock.inject(
        ($componentController, $rootScope, $httpBackend, $state, kdNamespaceService) => {
          scope = $rootScope;
          ctrl = $componentController('kdNamespaceSelect', {$scope: $rootScope});
          service = kdNamespaceService;
          httpBackend = $httpBackend;
          state = $state;
        });
  });

  it('should initialize from non-exisitng namespace and watch for state changes', () => {
    ctrl.$onInit();

    scope.$broadcast('$stateChangeSuccess', {}, {namespace: 'non-existing-namespace'});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('non-existing-namespace');

    state.go('fakeState', new StateParams('non-existing-namespace2'));
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('non-existing-namespace2');

    ctrl.loadNamespacesIfNeeded();
    httpBackend.whenGET('api/v1/namespace').respond({
      namespaces: [{objectMeta: {name: 'a'}}, {objectMeta: {name: 'b'}}, {objectMeta: {name: 'c'}}],
    });
    httpBackend.flush();
    expect(ctrl.namespaces).toEqual(['a', 'b', 'c']);
    expect(ctrl.selectedNamespace).toBe('__NAMESPACE_NOT_SELECTED__');
  });

  it('should initialize from exisitng namespace and watch for state changes', () => {
    expect(ctrl.selectedNamespace).toBe(undefined);
    ctrl.$onInit();
    expect(ctrl.selectedNamespace).toBe('__NAMESPACE_NOT_SELECTED__');

    scope.$broadcast('$stateChangeSuccess', {}, {namespace: 'a'});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('a');

    state.go('fakeState', new StateParams('a'));
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('a');

    ctrl.loadNamespacesIfNeeded();
    httpBackend.whenGET('api/v1/namespace').respond({
      namespaces: [{objectMeta: {name: 'a'}}, {objectMeta: {name: 'b'}}, {objectMeta: {name: 'c'}}],
    });
    httpBackend.flush();
    expect(ctrl.namespaces).toEqual(['a', 'b', 'c']);
    expect(ctrl.selectedNamespace).toBe('a');

    state.go('fakeState', {namespace: 'b'});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('b');

    state.go('fakeState', {namespace: 'foo-bar'});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('__NAMESPACE_NOT_SELECTED__');

    // Do not init twice. Nothing happens.
    ctrl.loadNamespacesIfNeeded();
  });

  it('should format namespace', () => {
    ctrl.selectedNamespace = '__NAMESPACE_NOT_SELECTED__';
    expect(ctrl.formatNamespace()).toBe('All user namespaces');
    ctrl.selectedNamespace = 'foo';
    expect(ctrl.formatNamespace('foo')).toBe('foo');
  });

  it('should change this.isMultipleNamespaces depending on namespaces selected', () => {
    ctrl.$onInit();

    expect(service.getMultipleNamespacesSelected()).toBe(true);

    scope.$broadcast('$stateChangeSuccess', {}, {namespace: 'a'});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('a');
    expect(service.getMultipleNamespacesSelected()).toBe(false);
  });
});
