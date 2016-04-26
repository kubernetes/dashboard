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

import replicationControllerListModule from 'replicationcontrollerlistdeprecated/replicationcontrollerlist_module';
import {redirectIfNeeded} from 'replicationcontrollerlistdeprecated/replicationcontrollerlist_stateconfig';

describe('StateConfig for replication controller list', () => {
  /** @type {!ui.router.$state} */
  let state;
  let deferred;
  let $rootScope;

  beforeEach(() => {
    angular.mock.module(replicationControllerListModule.name);
    angular.mock.inject(($state, $q, _$rootScope_) => {
      state = $state;
      $rootScope = _$rootScope_;
      deferred = $q.defer();
    });
    state.transition = deferred.promise;
  });

  it('should redirect to zerostate when RCs exist only in namespace kube-system', () => {
    // given
    spyOn(state, 'go');
    let replicationControllers = {
      replicationControllers: [
        {namespace: 'kube-system'},
      ],
    };

    // when
    redirectIfNeeded(state, replicationControllers);
    resolveStateTransitionPromise();
    // then
    expect(state.go).toHaveBeenCalled();
  });

  it('should redirect to zerostate if no RCs exist', () => {
    // given
    spyOn(state, 'go');
    let replicationControllers = {replicationControllers: []};

    // when
    redirectIfNeeded(state, replicationControllers);
    resolveStateTransitionPromise();

    // then
    expect(state.go).toHaveBeenCalled();
  });

  it('should not redirect to zerostate when RCs only exist in namespaces other than kube-system',
     () => {
       // given
       spyOn(state, 'go');
       let replicationControllers = {
         replicationControllers: [
           {namespace: 'foo-namespace'},
         ],
       };

       // when
       redirectIfNeeded(state, replicationControllers);
       resolveStateTransitionPromise();

       // then
       expect(state.go).not.toHaveBeenCalled();
     });

  it('should not redirect to zerostate when RCs exist both in namespace kube-system and other',
     () => {
       // given
       spyOn(state, 'go');
       let replicationControllers = {
         replicationControllers: [
           {namespace: 'foo-namespace'},
           {namespace: 'kube-system'},
         ],
       };

       // when
       redirectIfNeeded(state, replicationControllers);
       resolveStateTransitionPromise();

       // then
       expect(state.go).not.toHaveBeenCalled();
     });

  /**
   * Resolves the mocked state transition promise
   *
   * @export
   */
  function resolveStateTransitionPromise() {
    deferred.resolve();
    $rootScope.$apply();
  }
});
