/**
 * @final
 */
export default class DeploymentInfoController {
  /**
   * Constructs deployment info object.
   */
  constructor() {
    /**
     * Deployment details. Initialized from the scope.
     * @export {!backendApi.DeploymentDetail}
     */
    this.deployment;
  }

  /**
   * Returns true if the deployment strategy is RollingUpdate
   * @return {boolean}
   * @export
   */
  rollingUpdateStrategy() {
    return this.deployment.strategy === 'RollingUpdate';
  }
}

/**
 * Definition object for the component that displays replica set info.
 *
 * @type {!angular.Component}
 */
export const deploymentInfoComponent = {
  controller: DeploymentInfoController,
  templateUrl: 'deploymentdetail/deploymentinfo.html',
  bindings: {
    /** {!backendApi.DeploymentDetail} */
    'deployment': '=',
  },
};
