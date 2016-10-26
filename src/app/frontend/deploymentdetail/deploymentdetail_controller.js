
/**
 * @final
 */
export class DeploymentDetailController {
  /**
   * @param {!backendApi.DeploymentDetail} deploymentDetail
   * @param {!angular.Resource} kdDeploymentEventsResource
   * @param {!angular.Resource} kdDeploymentOldReplicaSetsResource
   * @ngInject
   */
  constructor(deploymentDetail, kdDeploymentEventsResource, kdDeploymentOldReplicaSetsResource) {
    /** @export {!backendApi.DeploymentDetail} */
    this.deploymentDetail = deploymentDetail;

    /** @export {!angular.Resource} */
    this.eventListResource = kdDeploymentEventsResource;

    /** @export {!angular.Resource} */
    this.oldReplicaSetListResource = kdDeploymentOldReplicaSetsResource;

    /** @export {!backendApi.ReplicaSetList} */
    this.newReplicaSetList = {
      replicaSets: [this.deploymentDetail.newReplicaSet],
      listMeta: {totalItems: 1},
    };
  }
}
