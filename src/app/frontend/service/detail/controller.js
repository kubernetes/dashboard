// Copyright 2017 The Kubernetes Dashboard Authors.
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
   * @param {!angular.$location} $location
   * @ngInject
   */
  constructor(
      serviceDetail, kdServicePodsResource, kdServiceEventsResource, kdServiceEndpointResource,
      $location) {
    /** @export {!backendApi.ServiceDetail} */
    this.serviceDetail = serviceDetail.userLinks ?
        this.checkUserlinksForProxyURL(serviceDetail, $location) :
        serviceDetail;

    /** {!angular.Resource} */
    this.servicePodsResource = kdServicePodsResource;

    /** @export {!angular.Resource} */
    this.eventListResource = kdServiceEventsResource;

    /** @export {!angular.Resource} */
    this.endpointListResource = kdServiceEndpointResource;
  }

  /**
   * This func looks for user defined links that use the k8's api server proxy addresses. Since the
   * default way of deploying/running dashboard is in a container we concluded that, for the time
   * being, we will parse the host:port address from the current browser window used to access the
   * k8's api server and inject it into the userlink proxy address so that its accessible from the
   * browser running dashboard.
   *
   * @param {!backendApi.ServiceDetail} serviceDetail
   * @param {!angular.$location} $location
   * @return {!backendApi.ServiceDetail} serviceDetail
   */
  checkUserlinksForProxyURL(serviceDetail, $location) {
    for (let i = 0; i < serviceDetail.userLinks.length; i++) {
      if (serviceDetail.userLinks[i].valid.toString() === 'true' &&
          serviceDetail.userLinks[i].proxyURL.toString() === 'true') {
        let currentLocationURL = document.createElement('a');
        let proxyURL = document.createElement('a');

        currentLocationURL.href = $location.absUrl();
        proxyURL.href = serviceDetail.userLinks[i].link;

        proxyURL.protocol = currentLocationURL.protocol;
        proxyURL.hostname = currentLocationURL.hostname;
        proxyURL.port = currentLocationURL.port;
        serviceDetail.userLinks[i].link = proxyURL.toString();
      }
    }

    return serviceDetail;
  }
}
