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

import {actionbarViewName} from 'chrome/chrome_state';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_component';
import {ReplicaSetDetailController} from './replicasetdetail_controller';
import {stateName as replicaSetList, stateUrl} from 'replicasetlist/replicasetlist_state';
import {stateName} from './replicasetdetail_state';

/**
 * Configures states for the replica set details view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: `${stateUrl}/:namespace/:replicaSet`,
    resolve: {
      'replicaSetDetailResource': getReplicaSetDetailResource,
      'replicaSetDetail': getReplicaSetDetail,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': '{{$stateParams.replicaSet}}',
        'parent': replicaSetList,
      },
    },
    views: {
      '': {
        controller: ReplicaSetDetailController,
        controllerAs: 'ctrl',
        templateUrl: 'replicasetdetail/replicasetdetail.html',
      },
      [actionbarViewName]: {},
    },
  });
}

/**
 * @param {!./replicasetdetail_state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource<!backendApi.ReplicaSetDetail>}
 * @ngInject
 */
export function getReplicaSetDetailResource($resource, $stateParams) {
  return $resource(`api/v1/replicasets/${$stateParams.namespace}/${$stateParams.replicaSet}`);
}

/**
 * @param {!angular.Resource<!backendApi.ReplicaSetDetail>} replicaSetDetailResource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
export function getReplicaSetDetail(replicaSetDetailResource) {
  return replicaSetDetailResource.get().$promise;
}
