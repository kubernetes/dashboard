// Copyright 2017 The Kubernetes Dashboard Authors.
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

import loginModule from 'login/module';

describe('Login component', () => {
  /** @type {!LoginController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(loginModule.name);

    angular.mock.inject(($componentController) => {
      ctrl = $componentController('kdLogin', {}, {});
    });
  });

  it('should update login spec',
     () => {
         // TODO(floreks): add test
     });

  it('should return new value',
     () => {
         // TODO(floreks): add test
     });

  it('should return old value',
     () => {
         // TODO(floreks): add test
     });

  it('should redirect to overview after successful logging in',
     () => {
         // TODO(floreks): add test
     });

  it('should show errors if there was an error during logging in',
     () => {
         // TODO(floreks): add test
     });

  it('should skip login page',
     () => {
         // TODO(floreks): add test
     });
});
