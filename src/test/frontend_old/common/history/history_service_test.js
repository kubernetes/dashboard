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

import module from 'common/history/module';

describe('History service', () => {
  /** @type {!common/history/service.HistoryService} */
  let service;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => angular.mock.module(module.name));

  beforeEach(angular.mock.inject((kdHistoryService, $rootScope, $state) => {
    service = kdHistoryService;
    service.init();
    scope = $rootScope;
    state = $state;
  }));

  // TODO: rewrite test to work with new state transition hooks
  xit('should go back in history', () => {
    spyOn(state, 'go');

    service.back('myDefault');
    expect(state.go.calls.mostRecent().args).toEqual(['myDefault', null]);

    scope.$broadcast('$stateChangeSuccess', {}, {}, {}, {foo: 'bar'});
    service.back('myDefault');
    expect(state.go.calls.mostRecent().args).toEqual(['myDefault', {foo: 'bar'}]);

    scope.$broadcast('$stateChangeSuccess', {}, {}, {name: 'someName'}, {foo: 'bar2'});
    service.back('myDefault');
    expect(state.go.calls.mostRecent().args).toEqual(['someName', {foo: 'bar2'}]);
  });
});
