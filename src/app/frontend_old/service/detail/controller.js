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
export class ServiceDetailController {
  /**
   * @param {!backendApi.ServiceDetail} serviceDetail
   * @param {!angular.Resource} kdServicePodsResource
   * @param {!angular.Resource} kdServiceEventsResource
   * @param {!angular.Resource} kdServiceEndpointResource
   * @ngInject
   */
  constructor(
      serviceDetail, kdServicePodsResource, kdServiceEventsResource, kdServiceEndpointResource) {
    /** @export {!backendApi.ServiceDetail} */
    this.serviceDetail = serviceDetail;

    /** {!angular.Resource} */
    this.servicePodsResource = kdServicePodsResource;

    /** @export {!angular.Resource} */
    this.eventListResource = kdServiceEventsResource;

    /** @export {!angular.Resource} */
    this.endpointListResource = kdServiceEndpointResource;
  }
}
