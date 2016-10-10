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
   * @return {number}
   * @export
   */
  getReleaseUpdatedTime() {
    return (new Date()).getTime() - this.release.info.last_deployed.seconds;
  }

  /**
   * @return {number}
   * @export
   */
  getReleaseCreatedTime() {
    return (new Date()).getTime() - this.release.info.first_deployed.seconds;
  }

  /**
   * @return {string}
   * @export
   */
  getReleaseStatus() {
    return statusCodes[this.release.info.status.code];
  }
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
    /** {!backendApi.Release} */
    'release': '=',
  },
};

const statusCodes = {
  1: "DEPLOYED",
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
    /** @export {string} @desc Label 'Status' for the release's status information
        on the release details page.*/
    MSG_RELEASE_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
    /** @export {string} @desc Label 'Chart' for the release's status information
        on the release details page.*/
    MSG_RELEASE_DETAIL_CHART_LABEL: goog.getMsg('Chart'),
    /** @export {string} @desc Label 'Version' for the release's status information
        on the release details page.*/
    MSG_RELEASE_DETAIL_VERSION_LABEL: goog.getMsg('Chart Version'),
    /** @export {string} @desc Label 'Created' for the release
        on the release details page.*/
    MSG_RELEASE_DETAIL_CREATED_LABEL: goog.getMsg('Created'),
    /** @export {string} @desc Label 'Updated' for the release
        on the release details page.*/
    MSG_RELEASE_DETAIL_UPDATED_LABEL: goog.getMsg('Updated'),
  };
}
