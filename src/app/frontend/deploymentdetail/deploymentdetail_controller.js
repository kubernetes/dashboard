
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
    /** @export {!backendApi.ReplicaSetList} */
    this.newReplicaSetList = {
      replicaSets: [this.deploymentDetail.newReplicaSet],
      listMeta: {totalItems: 1},
    };

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Label 'Overview' for the left navigation tab on the deployment details page. */
  MSG_DEPLOYMENT_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Title 'New Replica Set' for the newly createed replica set view,
      on the deployment details page. */
  MSG_DEPLOYMENT_DETAIL_NEW_REPLICAS_TITLE: goog.getMsg('New Replica Set'),
  /** @export {string} @desc Title 'Old Replica Sets' for the old replica sets view,
      on the deployment details page.*/
  MSG_DEPLOYMENT_DETAIL_OLD_REPLICAS_TITLE: goog.getMsg('Old Replica Sets'),
  /** @export {string} @desc Label 'Events' for the right navigation tab on the deployment details page.  */
  MSG_DEPLOYMENT_DETAIL_EVENTS_LABEL: goog.getMsg('Events'),
};
