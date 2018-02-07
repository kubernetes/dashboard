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

import {NetworkPolicyController} from 'networkpolicy/detail/controller';
import networkPolicyModule from 'networkpolicy/module';

describe('Network Policy Detail controller', () => {

  beforeEach(() => {
    angular.mock.module(networkPolicyModule.name);
  });

  it('should initialize network policy controller', angular.mock.inject(($controller) => {
    let data = {};
    /** @type {!NetworkPolicyController} */
    let ctrl = $controller(NetworkPolicyController, {networkPolicyDetail: data});

    expect(ctrl.networkPolicyDetail).toBe(data);
  }));
});
