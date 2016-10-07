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

import podDetailModule from 'poddetail/poddetail_module';
import podsListModule from 'podlist/podlist_module';

describe('Pod card list controller', () => {
  /**
   * @type {!podlist/podcardlist_component.PodCardListController}
   */
  let ctrl;
  /**
   * @type {!./../common/namespace/namespace_service.NamespaceService}
   */
  let data;

  beforeEach(() => {
    angular.mock.module(podsListModule.name);
    angular.mock.module(podDetailModule.name);

    angular.mock.inject(($componentController, $rootScope, kdNamespaceService) => {
      /** @type {!./../common/namespace/namespace_service.NamespaceService} */
      data = kdNamespaceService;
      /** @type {!podCardListController} */
      ctrl = $componentController(
          'kdPodCardList', {$scope: $rootScope, kdNamespaceService_: data}, {});
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });

  it('should return the value from Namespace service', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(data.areMultipleNamespacesSelected());
  });

  it('should execute logs href callback function', () => {
    expect(ctrl.getPodDetailHref({
      objectMeta: {
        name: 'foo-pod',
        namespace: 'foo-namespace',
      },
    })).toBe('#/pod/foo-namespace/foo-pod');
  });

  it('should check pod status correctly (succeeded is successful)', () => {
    expect(ctrl.isStatusSuccessful({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Succeeded'
      }
    })).toBeTruthy();
  });

  it('should check pod status correctly (running is successful)', () => {
    expect(ctrl.isStatusSuccessful({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Running'
      }
    })).toBeTruthy();
  });

  it('should check pod status correctly (failed isn\'t successful)', () => {
    expect(ctrl.isStatusSuccessful({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Failed'
      }
    })).toBeFalsy();
  });

  it('should check pod status correctly (pending is pending)', () => {
    expect(ctrl.isStatusPending({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Pending'
      }
    })).toBeTruthy();
  });

  it('should check pod status correctly (failed isn\'t pending)', () => {
    expect(ctrl.isStatusPending({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Failed'
      }
    })).toBeFalsy();
  });

  it('should check pod status correctly (failed is failed)', () => {
    expect(ctrl.isStatusFailed({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Failed'
      }
    })).toBeTruthy();
  });

  it('should check pod status correctly (running isn\'t failed)', () => {
    expect(ctrl.isStatusFailed({
      name: 'test-pod',
      podStatus: {
        podPhase: 'Running'
      }
    })).toBeFalsy();
  });

  it('should format the "pod start date" tooltip correctly', () => {
    expect(ctrl.getStartedAtTooltip('2016-06-06T09:13:12Z')).toBe('Started at 6/6/16 09:13 UTC');
  });

  it('should show and hide metrics', () => {
    ctrl.podList = {};
    expect(ctrl.showMetrics()).toBe(false);

    ctrl.podList.pods = [];
    expect(ctrl.showMetrics()).toBe(false);

    ctrl.podList.pods = [{}];
    expect(ctrl.showMetrics()).toBe(false);

    ctrl.podList.pods = [{metrics: {}}];
    expect(ctrl.showMetrics()).toBe(true);
  });

  it('should show and hide cpu metrics', () => {
    expect(ctrl.hasCpuUsage({})).toBe(false);

    expect(ctrl.hasCpuUsage({metrics: {}})).toBe(false);

    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: []}})).toBe(false);

    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: [1]}})).toBe(true);
  });

  it('should show and hide memory metrics', () => {
    expect(ctrl.hasMemoryUsage({})).toBe(false);

    expect(ctrl.hasMemoryUsage({metrics: {}})).toBe(false);

    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: []}})).toBe(false);

    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: [1]}})).toBe(true);
  });
});
