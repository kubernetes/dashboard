
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

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Label 'Overview' for the left navigation tab on the deployment details page. */
  MSG_DEPLOYMENT_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Title 'New Replica Set' for the newly created replica set view,
      on the deployment details page. */
  MSG_DEPLOYMENT_DETAIL_NEW_REPLICAS_TITLE: goog.getMsg('New Replica Set'),
  /** @export {string} @desc Title 'Old Replica Sets' for the old replica sets view,
      on the deployment details page.*/
  MSG_DEPLOYMENT_DETAIL_OLD_REPLICAS_TITLE: goog.getMsg('Old Replica Sets'),
  /** @export {string} @desc Label 'Events' for the right navigation tab on the deployment details page.  */
  MSG_DEPLOYMENT_DETAIL_EVENTS_LABEL: goog.getMsg('Events'),
  /** @export {string} @desc Title for new replica sets cards zero-state in deployment details page. */
  MSG_DEPLOYMENT_DETAIL_NEW_REPLICAS_ZEROSTATE_TITLE:
      goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Title for new replica set card zero-state in deployment details page. */
  MSG_DEPLOYMENT_DETAIL_NEW_REPLICAS_ZEROSTATE_TEXT:
      goog.getMsg('There are currently no new Replication Controllers on this Deployment'),
  /** @export {string} @desc Title for old replica sets cards zero-state in deployment details page. */
  MSG_DEPLOYMENT_DETAIL_OLD_REPLICAS_ZEROSTATE_TITLE:
      goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for old replica sets card zero-state in deployment details page. */
  MSG_DEPLOYMENT_DETAIL_OLD_REPLICAS_ZEROSTATE_TEXT:
      goog.getMsg('There are currently no old Replication Controllers on this Deployment'),
  /** @export {string} @desc Title for graph card displaying CPU metric of one deployment. */
  MSG_DEPLOYMENT_DETAIL_CPU_GRAPH_CARD_TITLE: goog.getMsg('CPU usage history'),
  /** @export {string} @desc Title for graph card displaying memory metric of one deployment. */
  MSG_DEPLOYMENT_DETAIL_MEMORY_GRAPH_CARD_TITLE: goog.getMsg('Memory usage history'),
};
