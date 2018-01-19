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

import namespaceModule from './../namespace/module';
import {SortableProperties} from './builder';
import {DataSelectService} from './service';

/**
 * Module providing data select operations for the application.
 */
export default angular.module('kubernetesDashboard.common.dataSelect', [namespaceModule.name])
    .service('kdDataSelectService', DataSelectService)
    .constant('SortableProperties', SortableProperties)
    .run(dataSelectConfig);

/**
 * @param {!angular.Scope} $rootScope
 * @param {!DataSelectApi.SortableProperties} SortableProperties
 * @ngInject
 */
function dataSelectConfig($rootScope, SortableProperties) {
  $rootScope.SortableProperties = SortableProperties;
}
