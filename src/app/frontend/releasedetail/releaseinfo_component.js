/**
 * @final
 */
export default class ReleaseInfoController {
  /**
   * Constructs release info object.
   */
  constructor() {
    /**
     * Release details. Initialized from the scope.
     * @export {!backendApi.ReleaseDetail}
     */
    this.release;

    /** @export */
    this.i18n = i18n(this.release);
  }

  /**
   * Returns true if the release strategy is RollingUpdate
   * @return {boolean}
   * @export
   */
  rollingUpdateStrategy() { return this.release.strategy === 'RollingUpdate'; }
}

/**
 * Definition object for the component that displays replica set info.
 *
 * @type {!angular.Component}
 */
export const releaseInfoComponent = {
  controller: ReleaseInfoController,
  templateUrl: 'releasedetail/releaseinfo.html',
  bindings: {
    /** {!backendApi.ReleaseDetail} */
    'release': '=',
  },
};

/**
 * @param  {!backendApi.ReleaseDetail} release
 * @return {!Object} a dictionary of translatable messages
 */
function i18n(release) {
  return {
    /** @export {string} @desc Subtitle 'Details' for the left section with general information
        about a release on the release details page.*/
    MSG_RELEASE_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
    /** @export {string} @desc Label 'Namespace' for the release namespace on the
        release details page.*/
    MSG_RELEASE_DETAIL_NAMESPACE_LABEL: goog.getMsg('Namespace'),
    /** @export {string} @desc Label 'Name' for the release name on the release
        details page.*/
    MSG_RELEASE_DETAIL_NAME_LABEL: goog.getMsg('Name'),
    /** @export {string} @desc Label 'Label selector' for the release's labels list
        on the release details page.*/
    MSG_RELEASE_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
    /** @export {string} @desc Label 'Label selector' for the release's selector on
        the release details page.*/
    MSG_RELEASE_DETAIL_LABEL_SELECTOR_LABEL: goog.getMsg('Label selector'),
    /** @export {string} @desc Label 'Status' for the release's status information
        on the release details page.*/
    MSG_RELEASE_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
    /** @export {string} @desc Label 'Strategy' for the release's strategy
        on the release details page.*/
    MSG_RELEASE_DETAIL_STRATEGY_LABEL: goog.getMsg('Strategy'),
    /** @export {string} @desc Label 'Min Ready Seconds' for the release
        on the release details page.*/
    MSG_RELEASE_DETAIL_MIN_READY_LABEL: goog.getMsg('Min ready seconds'),
    /** @export {string} @desc Label for the release property on the release details page.*/
    MSG_RELEASE_DETAIL_REVISION_HISTORY_LABEL: goog.getMsg('Revision history limit'),
    /** @export {string} @desc Label for the when revision history limit is not set.*/
    MSG_RELEASE_DETAIL_REVISION_HISTORY_NOT_SET_LABEL: goog.getMsg('Not set'),
    /** @export {string} @desc Label 'Rolling Update Strategy' for the release's rolling
        update strategy on the release details page.*/
    MSG_RELEASE_DETAIL_ROLLING_STRATEGY_LABEL: goog.getMsg('Rolling update strategy'),
    /** @export {string} @desc The message says that that many replicas were updated in the release
        (release details page). */
    MSG_RELEASE_DETAIL_REPLICAS_UPDATED_LABEL:
        goog.getMsg('{$replicas} updated', {'replicas': release.statusInfo.updated}),
    /** @export {string} @desc The message says that that many replicas (in total) are in the release
        (release details page). */
    MSG_RELEASE_DETAIL_REPLICAS_TOTAL_LABEL:
        goog.getMsg('{$replicas} total', {'replicas': release.statusInfo.replicas}),
    /** @export {string} @desc The message says that that many replicas are available in the release
        (release details page). */
    MSG_RELEASE_DETAIL_REPLICAS_AVAILABLE_LABEL:
        goog.getMsg('{$replicas} available', {'replicas': release.statusInfo.available}),
    /** @export {string} @desc The message says that that many replicas are unavailable in the release
        (release details page). */
    MSG_RELEASE_DETAIL_REPLICAS_UNAVAILABLE_LABEL:
        goog.getMsg('{$replicas} unavailable', {'replicas': release.statusInfo.unavailable}),
    /** @export @return {string} */
    getMaxUnavailableLabel: function() {
      /** @desc The message says how many replicas are allowed to be unavailable during an
          update in the release (release details page). */
      let MSG_RELEASE_DETAIL_MAX_UNAVAILABLE_LABEL = goog.getMsg(
          'Max unavailable: {$replicas}',
          {'replicas': release.rollingUpdateStrategy.maxUnavailable});
      return MSG_RELEASE_DETAIL_MAX_UNAVAILABLE_LABEL;
    },
    /** @export @return {string} */
    getMaxSurgeLabel: function() {
      /** @desc The message says that that many replicas can be created above the desired
      number of replicas in a release (release details page). */
      let MSG_RELEASE_DETAIL_MAX_SURGE_LABEL = goog.getMsg(
          'Max surge: {$replicas}', {'replicas': release.rollingUpdateStrategy.maxSurge});

      return MSG_RELEASE_DETAIL_MAX_SURGE_LABEL;
    },
  };
}
