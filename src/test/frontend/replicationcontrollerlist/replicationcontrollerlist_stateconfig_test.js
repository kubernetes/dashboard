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

import replicationControllerListModule from 'replicationcontrollerlist/replicationcontrollerlist_module';
import {redirectIfNeeded} from 'replicationcontrollerlist/replicationcontrollerlist_stateconfig';

describe('StateConfig for replication controller list', () => {
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!angular.$timeout} */
  let timeout;
  beforeEach(() => {
    angular.mock.module(replicationControllerListModule.name);

    angular.mock.inject(($state, $timeout) => {
      state = $state;
      timeout = $timeout;
    });
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
    redirectIfNeeded(state, timeout, replicationControllers);
    timeout.flush();

    // then
    expect(state.go).toHaveBeenCalled();
  });

  it('should redirect to zerostate if no RCs exist', () => {
    // given
    spyOn(state, 'go');
    let replicationControllers = {replicationControllers: []};

    // when
    redirectIfNeeded(state, timeout, replicationControllers);
    timeout.flush();

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
       redirectIfNeeded(state, timeout, replicationControllers);

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
       redirectIfNeeded(state, timeout, replicationControllers);

       // then
       expect(state.go).not.toHaveBeenCalled();
     });
});
