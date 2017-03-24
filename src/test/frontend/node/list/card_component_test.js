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

import nodeModule from 'node/module';

describe('Node card', () => {
  /** @type {!NodeCardController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(nodeModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdNodeCard', {$scope: $rootScope});
    });
  });

  it('should construct details href', () => {
    // given
    ctrl.node = {
      objectMeta: {
        name: 'foo-name',
      },
    };

    // then
    expect(ctrl.getNodeDetailHref()).toEqual('#!/node/foo-name');
  });

  it('should display check (success) icon', () => {
    // given
    ctrl.node = {
      objectMeta: {
        name: 'foo-name',
      },
      ready: 'True',
    };

    // then
    expect(ctrl.isInReadyState()).toBeTruthy();
    expect(ctrl.isInNotReadyState()).toBeFalsy();
    expect(ctrl.isInUnknownState()).toBeFalsy();
  });

  it('should display error icon', () => {
    // given
    ctrl.node = {
      objectMeta: {
        name: 'foo-name',
      },
      ready: 'False',
    };

    // then
    expect(ctrl.isInReadyState()).toBeFalsy();
    expect(ctrl.isInNotReadyState()).toBeTruthy();
    expect(ctrl.isInUnknownState()).toBeFalsy();
  });

  it('should display question (unknown) icon', () => {
    // given
    ctrl.node = {
      objectMeta: {
        name: 'foo-name',
      },
      ready: 'Unknown',
    };

    // then
    expect(ctrl.isInReadyState()).toBeFalsy();
    expect(ctrl.isInNotReadyState()).toBeFalsy();
    expect(ctrl.isInUnknownState()).toBeTruthy();
  });

  it('should format the "created at" tooltip correctly', () => {
    expect(ctrl.getCreatedAtTooltip('2016-06-06T09:13:12Z'))
        .toMatch('Created at 2016-06-06T09:13.*');
  });
});
