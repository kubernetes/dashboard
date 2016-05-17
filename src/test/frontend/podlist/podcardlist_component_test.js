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

import podsListModule from 'podlist/podlist_module';
import podDetailModule from 'poddetail/poddetail_module';

describe('Pod card list controller', () => {
  /**
   * @type {!podlist/podcardlist_component.PodCardListController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(podsListModule.name);
    angular.mock.module(podDetailModule.name);

    angular.mock.inject(($componentController) => {
      ctrl = $componentController('kdPodCardList', {}, {
        logsHrefFn: function() {},
      });
    });
  });

  it('should execute logs href callback function', () => {
    // given
    let pod = {name: 'test-pod'};
    spyOn(ctrl, 'logsHrefFn');

    // when
    ctrl.getPodLogsHref(pod);

    // then
    expect(ctrl.logsHrefFn).toHaveBeenCalledWith({pod: pod});
  });

  it('should execute logs href callback function', () => {
    expect(ctrl.getPodDetailHref({
      objectMeta: {
        name: 'foo-pod',
        namespace: 'foo-namespace',
      },
    })).toBe('#/pods/foo-namespace/foo-pod');
  });
});
