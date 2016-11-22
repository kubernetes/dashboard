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

import chromeModule from 'chrome/chrome_module';
import componentsModule from 'common/components/components_module';
import filtersModule from 'common/filters/filters_module';
import eventsModule from 'events/events_module';
import resourceLimitsModule from 'resourcelimit/resourcelimit_module';
import resourceQuotasModule from 'resourcequotadetail/resourcequotadetail_module';

import stateConfig from './namespacedetail_stateconfig';
import {namespaceInfoComponent} from './namespaceinfo_component';


/**
 * Angular module for the Namespace details view.
 *
 * The view shows detailed view of a Namespace.
 */
export default angular
    .module(
        'kubernetesDashboard.namespaceDetail',
        [
          'ngMaterial',
          'ngResource',
          'ui.router',
          componentsModule.name,
          chromeModule.name,
          filtersModule.name,
          eventsModule.name,
          resourceQuotasModule.name,
          resourceLimitsModule.name,
        ])
    .config(stateConfig)
    .component('kdNamespaceInfo', namespaceInfoComponent)
    .factory('kdNamespaceEventsResource', namespaceEventsResource);

/**
 * @param {!angular.$resource} $resource
 * @return {!angular.Resource}
 * @ngInject
 */
function namespaceEventsResource($resource) {
  return $resource('api/v1/namespace/:name/event');
}
