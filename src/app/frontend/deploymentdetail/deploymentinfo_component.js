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

    /** @export */
    this.i18n = i18n(this.deployment);
  }

  /**
   * Returns true if the deployment strategy is RollingUpdate
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

/**
 * @param  {!backendApi.DeploymentDetail} deployment
 * @return {!Object} a dictionary of translatable messages
 */
function i18n(deployment) {
  return {
    /** @export {string} @desc Title 'Resource details' at the top of the deployment
        details page.*/
    MSG_DEPLOYMENT_DETAIL_RESOURCE_DETAILS_TITLE: goog.getMsg('Resource details'),
    /** @export {string} @desc Subtitle 'Details' for the left section with general information
        about a deployment on the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
    /** @export {string} @desc Label 'Namespace' for the deployment namespace on the
        deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_NAMESPACE_LABEL: goog.getMsg('Namespace'),
    /** @export {string} @desc Label 'Name' for the deployment name on the deployment
        details page.*/
    MSG_DEPLOYMENT_DETAIL_NAME_LABEL: goog.getMsg('Name'),
    /** @export {string} @desc Label 'Label selector' for the deployment's labels list
        on the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
    /** @export {string} @desc Label 'Label selector' for the deployment's selector on
        the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_LABEL_SELECTOR_LABEL: goog.getMsg('Label selector'),
    /** @export {string} @desc Label 'Status' for the deployment's status information
        on the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
    /** @export {string} @desc Label 'Strategy' for the deployment's strategy
        on the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_STRATEGY_LABEL: goog.getMsg('Strategy'),
    /** @export {string} @desc Label 'Min Ready Seconds' for the deployment
        on the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_MIN_READY_LABEL: goog.getMsg('Min Ready Seconds'),
    /** @export {string} @desc Label 'Rolling Update Strategy' for the deployment's rolling
        update strategy on the deployment details page.*/
    MSG_DEPLOYMENT_DETAIL_ROLLING_STRATEGY_LABEL: goog.getMsg('Rolling Update Strategy'),
    /** @export {string} @desc The message says that that many replicas were updated in the deployment
        (deployment details page). */
    MSG_DEPLOYMENT_DETAIL_REPLICAS_UPDATED_LABEL:
        goog.getMsg('{$replicas} updated', {'replicas': deployment.status.updated}),
    /** @export {string} @desc The message says that that many replicas (in total) are in the deployment
        (deployment details page). */
    MSG_DEPLOYMENT_DETAIL_REPLICAS_TOTAL_LABEL:
        goog.getMsg('{$replicas} total', {'replicas': deployment.status.replicas}),
    /** @export {string} @desc The message says that that many replicas are available in the deployment
        (deployment details page). */
    MSG_DEPLOYMENT_DETAIL_REPLICAS_AVAILABLE_LABEL:
        goog.getMsg('{$replicas} available', {'replicas': deployment.status.available}),
    /** @export {string} @desc The message says that that many replicas are unavailable in the deployment
        (deployment details page). */
    MSG_DEPLOYMENT_DETAIL_REPLICAS_UNAVAILABLE_LABEL:
        goog.getMsg('{$replicas} unavailable', {'replicas': deployment.status.unavailable}),
    /** @export {string} @desc The message says how many replicas are allowed to be unavailable during an
        update in the deployment (deployment details page). */
    MSG_DEPLOYMENT_DETAIL_MAX_UNAVAILABLE_LABEL: goog.getMsg(
        'Max unavailable: {$replicas}',
        {'replicas': deployment.rollingUpdateStrategy.maxUnavailable}),
    /** @export {string} @desc The message says that that many replicas can be created above the desired
        number of replicas in a deployment (deployment details page). */
    MSG_DEPLOYMENT_DETAIL_MAX_SURGE_LABEL: goog.getMsg(
        'Max surge: {$replicas}', {'replicas': deployment.rollingUpdateStrategy.maxSurge}),
  };
}
