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
export class PodDetailController {
  /**
   * @param {!backendApi.PodDetail} podDetail
   * @param {!angular.Resource} kdPodEventsResource
   * @param {!angular.Resource} kdPodPersistentVolumeClaimsResource
   * @ngInject
   */
  constructor(podDetail, kdPodEventsResource, kdPodPersistentVolumeClaimsResource) {
    /** @export {!backendApi.PodDetail} */
    this.podDetail = podDetail;

    /** @export {!angular.Resource} */
    this.eventListResource = kdPodEventsResource;

    /**@export {!angular.Resource} */
    this.persistentVolumeClaimsResource = kdPodPersistentVolumeClaimsResource;
  }
}
