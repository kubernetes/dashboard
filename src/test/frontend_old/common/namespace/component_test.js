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

import chromeModule from 'chrome/module';
import {namespaceParam, StateParams} from 'chrome/state';
import module from 'common/namespace/module';

describe('Namespace select component ', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!common/namespace/component.NamespaceSelectController} */
  let ctrl;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!common/state/service.FutureStateService}*/
  let kdFutureStateService;

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
        ($componentController, $rootScope, $httpBackend, $state, _kdFutureStateService_) => {
          scope = $rootScope;
          let element = angular.element('<div></div>');
          ctrl = $componentController('kdNamespaceSelect', {$scope: $rootScope, $element: element});
          httpBackend = $httpBackend;
          state = $state;
          kdFutureStateService = _kdFutureStateService_;
        });
  });

  it('should initialize from non-exisitng namespace and watch for state changes', () => {
    ctrl.$onInit();

    kdFutureStateService.params = {namespace: 'non-existing-namespace'};
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
    expect(ctrl.selectedNamespace).toBe('non-existing-namespace2');
  });

  it('should initialize from exisitng namespace and watch for state changes', () => {
    expect(ctrl.selectedNamespace).toBe(undefined);
    ctrl.$onInit();
    expect(ctrl.selectedNamespace).toBe('default');

    kdFutureStateService.params = {namespace: 'a'};
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
    expect(ctrl.selectedNamespace).toBe('default');

    state.go('fakeState', {namespace: '_all'});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('_all');

    // Do not init twice. Nothing happens.
    ctrl.loadNamespacesIfNeeded();
  });

  it('should initialize from all namespaces', () => {
    ctrl.$onInit();
    state.go('fakeState', new StateParams('_all'));
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('_all');

    ctrl.loadNamespacesIfNeeded();
    httpBackend.whenGET('api/v1/namespace').respond({
      namespaces: [{objectMeta: {name: 'a'}}],
    });
    httpBackend.flush();
    expect(ctrl.namespaces).toEqual(['a']);
    expect(ctrl.selectedNamespace).toBe('_all');
  });

  it('should format namespace', () => {
    ctrl.selectedNamespace = '_all';
    expect(ctrl.formatNamespace()).toBe('All namespaces');
    ctrl.selectedNamespace = 'foo';
    expect(ctrl.formatNamespace('foo')).toBe('foo');
  });

  it('should remove xss risks from nonexisting namespaces', () => {
    ctrl.$onInit();
    let unsafe = '<img src="x" onerror="alert(document.domain)">';
    state.go('fakeState', {namespace: unsafe});
    scope.$digest();
    expect(ctrl.selectedNamespace).toBe('default');
  });

  it('should select namespace', () => {
    // given
    spyOn(state, 'go');
    let newNamespace = 'namespace-1';
    ctrl.namespaceInput = newNamespace;

    // when
    ctrl.selectNamespace();

    // then
    expect(ctrl.namespaceInput).toEqual('');
    expect(ctrl.selectedNamespace).toEqual(newNamespace);
    expect(state.go).toHaveBeenCalledWith('.', {[namespaceParam]: ctrl.selectedNamespace});
  });
});
