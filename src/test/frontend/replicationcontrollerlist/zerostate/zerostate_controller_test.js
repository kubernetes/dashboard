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

import ZerostateController from 'replicationcontrollerlist/zerostate/zerostate_controller';
import {StateParams} from './zerostate_state_state';

describe('Zerostate controller', () => {
  let ctrl;

  /** @type {!StateParams} */
  const stateParams = new StateParams();

  beforeEach(() => {angular.mock.inject(($controller) => { ctrl = $controller(stateParams); })});

  it('should do something', () => {
    expect(ctrl.learnMoreLinks).toEqual([
      {title: 'Dashboard Tour', link: "#"},
      {title: 'Deploying your App', link: "#"},
      {title: 'Monitoring your App', link: "#"},
      {title: 'Troubleshooting', link: "#"},
    ]);
    expect(ctrl.containsOnlyKubeSystemRCs).toEqual(stateParams.containsOnlyKubeSystemRCs);
  });
});
