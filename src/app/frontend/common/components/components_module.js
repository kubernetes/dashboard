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

import filtersModule from '../filters/filters_module';
import labelsDirective from './labels/labels_directive';
import middleEllipsisDirective from './middleellipsis/middleellipsis_directive';
import contentCardModule from './contentcard/contentcard_module';
import endpointModule from './endpoint/endpoint_module';
import infoCardModule from './infocard/infocard_module';
import resourceCardModule from './resourcecard/resourcecard_module';
import actionbarModule from './actionbar/actionbar_module';
import sparklineDirective from './sparkline/sparkline_directive';
import warnThresholdDirective from './warnthreshold/warnthreshold_directive';

/**
 * Module containing common components for the application.
 */
export default angular.module('kubernetesDashboard.common.components',
                              [
                                'ngMaterial',
                                'ui.router',
                                filtersModule.name,
                                actionbarModule.name,
                                contentCardModule.name,
                                endpointModule.name,
                                infoCardModule.name,
                                resourceCardModule.name,
                              ])
    .directive('kdLabels', labelsDirective)
    .directive('kdMiddleEllipsis', middleEllipsisDirective)
    .directive('kdSparkline', sparklineDirective)
    .directive('kdWarnThreshold', warnThresholdDirective);
