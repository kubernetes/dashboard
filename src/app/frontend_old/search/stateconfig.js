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
 * @param {!angular.$resource} kdSearchResource
 * @param {!searchApi.StateParams} $stateParams
 * @param {!./../common/namespace/service.NamespaceService} kdNamespaceService
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function resolveSearch(
    kdSearchResource, kdSettingsService, $stateParams, kdNamespaceService) {
  let query = new DataSelectQueryBuilder(kdSettingsService.getItemsPerPage())
                  .setNamespace($stateParams.namespace)
                  .setFilterBy($stateParams.q)
                  .build();

  if (kdNamespaceService.isMultiNamespace(query.namespace)) {
    query.namespace = '';
  }

  return kdSearchResource.get(query).$promise;
}
