// Copyright 2017 The Kubernetes Authors.
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
export class DiscoveryController {
  /**
   * @param {!backendApi.Discovery} discovery
   * @param {!angular.Resource} kdServiceListResource
   * @param {!angular.Resource} kdIngressListResource
   * @ngInject
   */
  constructor(discovery, kdServiceListResource, kdIngressListResource) {
    /** @export {!backendApi.Discovery} */
    this.discovery = discovery;

    /** @export {!angular.Resource} */
    this.kdServiceListResource = kdServiceListResource;

    /** @export {!angular.Resource} */
    this.kdIngressListResource = kdIngressListResource;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    /** @type {number} */
    let resourcesLength = this.discovery.serviceList.listMeta.totalItems +
        this.discovery.ingressList.listMeta.totalItems;
    return resourcesLength === 0;
  }
}
