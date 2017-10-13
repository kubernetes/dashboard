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

import deploymentListModule from 'deployment/module';

describe('Deployment card', () => {
  /**
   * @type {!DeploymentCardController}
   */
  let ctrl;
  /**
   * @type {!ScaleService}
   */
  let scaleData;

  beforeEach(() => {
    angular.mock.module(deploymentListModule.name);

    angular.mock.inject(($componentController, $rootScope, kdScaleService) => {
      /* @type {!ScaleService} */
      scaleData = kdScaleService;
      ctrl = $componentController('kdDeploymentCard', {
        $scope: $rootScope,
        kdScaleService_: scaleData,
      });
    });
  });

  it('should construct details href', () => {
    // given
    ctrl.deployment = {
      objectMeta: {
        name: 'foo-name',
        namespace: 'foo-namespace',
      },
    };

    // then
    expect(ctrl.getDeploymentDetailHref()).toEqual('#!/deployment/foo-namespace/foo-name');
  });

  it('should return true when at least one replication controller pod has warning', () => {
    // given
    ctrl.deployment = {
      pods: {
        warnings: [
          {
            message: 'test-error',
            reason: 'test-reason',
          },
        ],
      },
    };

    // then
    expect(ctrl.hasWarnings()).toBeTruthy();
  });

  it('should return false when there are no errors related to replication controller pods', () => {
    // given
    ctrl.deployment = {
      pods: {
        warnings: [],
      },
    };

    // then
    expect(ctrl.hasWarnings()).toBe(false);
    expect(ctrl.isSuccess()).toBe(true);
  });

  it('should return true when there are no warnings and at least one pod is in pending state',
     () => {
       // given
       ctrl.deployment = {
         pods: {
           warnings: [],
           pending: 1,
         },
       };

       // then
       expect(ctrl.isPending()).toBe(true);
       expect(ctrl.isSuccess()).toBe(false);
     });

  it('should return false when there is warning related to replication controller pods', () => {
    // given
    ctrl.deployment = {
      pods: {
        warnings: [
          {
            message: 'test-error',
            reason: 'test-reason',
          },
        ],
      },
    };

    // then
    expect(ctrl.hasWarnings()).toBe(true);
    expect(ctrl.isPending()).toBe(false);
    expect(ctrl.isSuccess()).toBe(false);
  });

  it('should return false when there are no warnings and there is no pod in pending state', () => {
    // given
    ctrl.deployment = {
      pods: {
        warnings: [],
        pending: 0,
      },
    };

    // then
    expect(ctrl.isPending()).toBe(false);
    expect(ctrl.isSuccess()).toBe(true);
  });
});
