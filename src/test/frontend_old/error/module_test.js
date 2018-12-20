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

import errorModule from 'error/module';

// TODO: rewrite test to work with new state transition hooks
xdescribe('Error module', () => {
  beforeEach(angular.mock.module(errorModule.name));

  it('should register route error handlers',
     angular.mock.inject(($rootScope, $state, $stateParams) => {
       // given
       let error = {error: 'bar'};
       expect($state.current.name).toBe('');

       // when
       $rootScope.$broadcast('$stateChangeError', {}, {namespace: 'foo'}, null, null, error);
       $rootScope.$apply();

       // then
       expect($state.current.name).toBe('internalerror');
       expect($stateParams.namespace).toBe('foo');
       expect($stateParams.error).toEqual(error);
     }));

  it('should not fall into redirect loop', angular.mock.inject(($rootScope, $state) => {
    // given
    let error = {error: 'bar'};
    expect($state.current.name).toBe('');

    // when
    $rootScope.$broadcast(
        '$stateChangeError', {name: 'internalerror'}, {namespace: 'foo'}, null, null, error);
    $rootScope.$apply();

    // then
    expect($state.current.name).toBe('');
  }));
});
