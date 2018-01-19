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
 * Opens replication controller delete dialog.
 *
 * @final
 */
export class ReplicationControllerService {
  /**
   * @param {!./../../common/resource/verber_service.VerberService} kdResourceVerberService
   * @ngInject
   */
  constructor(kdResourceVerberService) {
    /** @private {!./../../common/resource/verber_service.VerberService}*/
    this.kdResourceVerberService_ = kdResourceVerberService;
  }

  /**
   * @param {!backendApi.TypeMeta} typeMeta
   * @param {!backendApi.ObjectMeta} objectMeta
   * @return {!angular.$q.Promise}
   */
  showDeleteDialog(typeMeta, objectMeta) {
    // TODO: localize this name
    return this.kdResourceVerberService_.showDeleteDialog(
        'Replication Controller', typeMeta, objectMeta);
  }
}
