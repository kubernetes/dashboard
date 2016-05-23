
/**
 * @final
 */
export class DeploymentDetailController {
  /**
   * @param {!backendApi.DeploymentDetail} deploymentDetail
   * @ngInject
   */
  constructor(deploymentDetail) {
    /** @export {!backendApi.DeploymentDetail} */
    this.deploymentDetail = deploymentDetail;
  }
}
