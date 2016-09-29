
import {DeploymentDetailController} from 'deploymentdetail/deploymentdetail_controller';
import deploymentDetailModule from 'deploymentdetail/deploymentdetail_module';

describe('Deployment Detail controller', () => {

  beforeEach(() => {
    angular.mock.module(deploymentDetailModule.name);
  });

  it('should initialize deployment detail', angular.mock.inject(($controller) => {
    let data = {};
    /** @type {!DeploymentDetailController} */
    let ctrl = $controller(DeploymentDetailController, {deploymentDetail: data});

    expect(ctrl.deploymentDetail).toBe(data);
  }));
});
