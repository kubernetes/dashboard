import deploymentDetailModule from 'deploymentdetail/deploymentdetail_module';

describe('Deployment Info controller', () => {
  /** @type {!DeploymentInfoController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deploymentDetailModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdDeploymentInfo', {$scope: $rootScope}, {
        deployment: {
          statusInfo: {
            updated: 0,
            replicas: 0,
            available: 0,
            unavailable: 0,
          },
          rollingUpdateStrategy: {
            maxUnavailable: 0,
            maxSurge: 0,
          },
        },
      });
    });
  });

  describe('#rollingUpdateStrategy', () => {
    it('returns true when strategy is rolling update', () => {
      // given
      ctrl.deployment = {
        strategy: 'RollingUpdate',
      };

      // then
      expect(ctrl.rollingUpdateStrategy()).toBeTruthy();
    });

    it('returns true when strategy is rolling update', () => {
      // given
      ctrl.deployment = {
        strategy: 'Recreate',
      };

      // then
      expect(ctrl.rollingUpdateStrategy()).toBeFalsy();
    });
  });

  describe('constructor', () => {
    it('should work with recreate strategy',
       angular.mock.inject(($componentController, $rootScope) => {
         // No error should be thrown.
         $componentController('kdDeploymentInfo', {$scope: $rootScope}, {
           deployment: {
             statusInfo: {},
           },
         });
       }));
  });
});
