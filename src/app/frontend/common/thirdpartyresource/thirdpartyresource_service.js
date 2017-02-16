
/**
 * @final
 */
export class ThirdPartyResourceService {
  /**
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @ngInject
   */
  constructor($resource, $q) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!backendApi.ThirdPartyResourceList} */
    this.thirdPartyResourceList_;
  }

  /**
   * TODO: add comment
   * @returns {!angular.$q.Promise}
   */
  resolve() {
    let deferred = this.q_.defer();

    this.resource_('api/v1/thirdpartyresource').get().$promise.then((result) => {
      this.thirdPartyResourceList_ = result;
      deferred.resolve();
    });

    return deferred.promise;
  }

  /**
   * @returns {!backendApi.ThirdPartyResourceList}
   */
  getThirdPartyResourceList() {
    return this.thirdPartyResourceList_;
  }

  /**
   * Return true when there are any third party resources registered in the system, false otherwise.
   * @returns {boolean}
   */
  areThirdPartyResourcesRegistered() {
    return !!this.thirdPartyResourceList_ && !!this.thirdPartyResourceList_.thirdPartyResources &&
        this.thirdPartyResourceList_.thirdPartyResources.length > 0;
  }
}
