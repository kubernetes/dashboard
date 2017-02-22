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

import thirdPartyResourceDetailModule from 'thirdpartyresourcedetail/detail_module';

describe('Third Party Resource Info controller', () => {
  /** @type {!ThirdPartyResourceInfoController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(thirdPartyResourceDetailModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl =
          $componentController('kdThirdPartyResourceInfo', {$scope: $rootScope}, {tprDetail: {}});
    });
  });

  it('should initialize the ctrl', () => {
    expect(ctrl.tprDetail).not.toBeUndefined();
  });
});
