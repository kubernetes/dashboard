// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
   * Returns list of third party resources from the backend.
   * @return {!angular.$q.Promise}
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
   * @return {!backendApi.ThirdPartyResourceList}
   */
  getThirdPartyResourceList() {
    return this.thirdPartyResourceList_;
  }

  /**
   * Return true when there are any third party resources registered in the system, false otherwise.
   * @return {boolean}
   */
  areThirdPartyResourcesRegistered() {
    return !!this.thirdPartyResourceList_ && !!this.thirdPartyResourceList_.thirdPartyResources &&
        this.thirdPartyResourceList_.thirdPartyResources.length > 0;
  }
}
