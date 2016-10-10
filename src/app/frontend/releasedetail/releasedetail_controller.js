
/**
 * @final
 */
export class ReleaseDetailController {
  /**
   * @param {!backendApi.ReleaseDetail} releaseDetail
   * @ngInject
   */
  constructor(releaseDetail) {
    /** @export {!backendApi.ReleaseDetail} */
    this.releaseDetail = releaseDetail;

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Label 'Overview' for the left navigation tab on the release details page. */
  MSG_RELEASE_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Title for relase cards zero-state in release details page. */
  MSG_RELEASE_DETAIL_ZEROSTATE_TITLE:
      goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for relase cards zero-state in release details page. */
  MSG_RELEASE_DETAIL_ZEROSTATE_TEXT:
      goog.getMsg('There are currently no details on this Release'),
};
