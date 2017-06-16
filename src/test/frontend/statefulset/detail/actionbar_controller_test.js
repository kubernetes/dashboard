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

import {ActionBarController} from 'statefulset/detail/actionbar_controller';
import module from 'statefulset/module';

describe('Action Bar controller', () => {
  /** @type {!ActionBarController} */
  let ctrl;
  /** @type {!ScaleService} */
  let kdScaleService;
  let details = {};

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($controller, _kdScaleService_) => {
      kdScaleService = _kdScaleService_;

      ctrl = $controller(ActionBarController, {
        statefulSetDetail: details,
        kdScaleService: _kdScaleService_,
      });
    });
  });

  it('should initialize details', () => {
    expect(ctrl.details).toBe(details);
  });

  it('should show edit replicas dialog', () => {
    // given
    ctrl.details = {
      objectMeta: {
        namespace: 'foo-namespace',
        name: 'foo-name',
      },
      typeMeta: {
        kind: '',
      },
      podInfo: {
        current: 3,
        desired: 3,
      },
    };
    spyOn(kdScaleService, 'showScaleDialog');

    // when
    ctrl.handleScaleResourceDialog();

    // then
    expect(kdScaleService.showScaleDialog).toHaveBeenCalled();
  });
});
