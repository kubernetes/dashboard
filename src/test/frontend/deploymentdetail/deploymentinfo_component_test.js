import deploymentDetailModule from 'deploymentdetail/deploymentdetail_module';

describe('Deployment Info controller', () => {
  /**
* Deployment Info controller.
* @type {!DeploymentInfoController}
*/
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deploymentDetailModule.name);

    angular.mock.inject(
      ($componentController) => { ctrl = $componentController('kdDeploymentInfo', {}); });
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
});
