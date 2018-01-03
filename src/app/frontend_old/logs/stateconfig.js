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

import {stateName as chromeStateName} from '../chrome/state';
import {fillContentConfig} from '../chrome/state';
import {breadcrumbsConfig} from '../common/components/breadcrumbs/service';
import {appendDetailParamsToUrl} from '../common/resource/resourcedetail';

import {stateName} from './state';

/**
 * Configures states for the logs view.
 *
 * @param {!ui.router.$stateProvider} $stateProvider
 * @ngInject
 */
export default function stateConfig($stateProvider) {
  $stateProvider.state(stateName, {
    url: `${appendDetailParamsToUrl('/log')}/:resourceType`,
    parent: chromeStateName,
    resolve: {
      'logSources': resolveLogSources,
      'podLogs': resolvePodLogs,
    },
    data: {
      [breadcrumbsConfig]: {
        'label': i18n.MSG_BREADCRUMBS_LOGS_LABEL,
      },
      [fillContentConfig]: true,
    },
    views: {
      '': {
        component: 'kdLogs',
      },
    },
  });
}

/**
 * Load all log sources (pods and containers) that are available
 *
 * @param {!./state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolveLogSources($stateParams, $resource) {
  let namespace = $stateParams.objectNamespace;
  let objectName = $stateParams.objectName;
  let resourceType = $stateParams.resourceType || '';

  /** @type {!angular.Resource} */
  let resource = $resource(`api/v1/log/source/${namespace}/${objectName}/${resourceType}`);
  return resource.get().$promise;
}


/**
 * Load log lines for a given logSources object. Log sources contains either a list of containers
 * and pods of a higher level controller or a single pod. In case of a list the first entry is
 * chosen as default.
 *
 * @param {!./state.StateParams} $stateParams
 * @param {!angular.$resource} $resource
 * @param {!backendApi.LogSources} logSources
 * @return {!angular.$q.Promise}
 * @ngInject
 */
function resolvePodLogs($stateParams, $resource, logSources) {
  let namespace = $stateParams.objectNamespace;
  let resourceType = $stateParams.resourceType || '';
  let podName = $stateParams.objectName;

  // use first pod as default in case of a higher level controller (like ReplicaSet)
  if (resourceType !== 'Pod') {
    podName = logSources.podNames[0];
  }

  /** @type {!angular.Resource} */
  let resource = $resource(`api/v1/log/${namespace}/${podName}`);
  return resource.get().$promise;
}

const i18n = {
  /** @type {string} @desc Breadcrum label for the logs view. */
  MSG_BREADCRUMBS_LOGS_LABEL: goog.getMsg('Logs'),
};
