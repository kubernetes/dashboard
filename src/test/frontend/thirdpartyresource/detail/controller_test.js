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

import {ThirdPartyResourceDetailController} from 'thirdpartyresource/detail/controller';
import thirdPartyResourceModule from 'thirdpartyresource/module';

describe('Third Party Resource Detail controller', () => {
  beforeEach(() => {
    angular.mock.module(thirdPartyResourceModule.name);
  });

  it('should initialize storage class controller', angular.mock.inject(($controller) => {
    let data = {};
    /** @type {!ThirdPartyResourceDetailController} */
    let ctrl = $controller(ThirdPartyResourceDetailController, {tprDetail: data});

    expect(ctrl.tprDetail).toBe(data);
  }));
});
