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
export class ReplicaSetDetailController {
  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {!angular.Resource} kdReplicaSetPodsResource
   * @param {!angular.Resource} kdReplicaSetServicesResource
   * @param {!angular.Resource} kdReplicaSetEventsResource
   * @ngInject
   */
  constructor(
      replicaSetDetail, kdReplicaSetPodsResource, kdReplicaSetServicesResource,
      kdReplicaSetEventsResource) {
    /** @export {!backendApi.ReplicaSetDetail} */
    this.replicaSetDetail = replicaSetDetail;

    /** @export {!angular.Resource} */
    this.replicaSetPodsResource = kdReplicaSetPodsResource;

    /** @export {!angular.Resource} */
    this.replicaSetServicesResource = kdReplicaSetServicesResource;

    /** @export {!angular.Resource} */
    this.eventListResource = kdReplicaSetEventsResource;
  }
}
