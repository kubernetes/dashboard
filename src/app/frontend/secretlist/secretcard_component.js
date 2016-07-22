class SecretCardController {
  /**
   * @ngInject
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   */
  constructor($interpolate, kdNamespaceService) {
    /**
     * Secret initialised from scope
     * @export {!backendApi.Secret}
     */
    this.secret;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @export
   * @param  {string} startDate - start date of the secret
   * @return {string} localized tooltip with the formated start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date:'d/M/yy HH:mm':'UTC'}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the secret.*/
    let MSG_SECRET_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Started at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_SECRET_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * @type {!angular.Component}
 */
export const secretCardComponent = {
  bindings: {
    'secret': '=',
  },
  controller: SecretCardController,
  templateUrl: 'secretlist/secretcard.html',
};
