/**
 * @final
 */
export default class DeploymentInfoController {
  /**
   * Constructs replication controller info object.
   */
  constructor() {
    /**
     * Deployment details. Initialized from the scope.
     * @export {!backendApi.DeploymentDetail}
     */
    this.deployment;
  }

  /**
   * @return {boolean}
   * @export
   */
  rollingUpdateStrategy() { return this.deployment.strategy === 'RollingUpdate'; }
}

/**
 * Definition object for the component that displays replica set info.
 *
 * @return {!angular.Directive}
 */
export const deploymentInfoComponent = {
  controller: DeploymentInfoController,
  templateUrl: 'deploymentdetail/deploymentinfo.html',
  bindings: {
    /** {!backendApi.DeploymentDetail} */
    'deployment': '=',
  },
};
