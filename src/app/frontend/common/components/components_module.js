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

import stateModule from 'common/state/module';
import filtersModule from '../filters/filters_module';
import namespaceModule from './../namespace/namespace_module';
import paginationModule from './../pagination/pagination_module';
import actionbarModule from './actionbar/actionbar_module';
import annotationsModule from './annotations/module';
import conditionsModule from './conditions/conditions_module';
import contentCardModule from './contentcard/contentcard_module';
import endpointModule from './endpoint/endpoint_module';
import graphModule from './graph/graph_module';
import infoCardModule from './infocard/infocard_module';
import {labelComponent} from './labels/component';
import {middleEllipsisComponent} from './middleellipsis/component';
import resourceCardModule from './resourcecard/resourcecard_module';
import resourceDetailModule from './resourcedetail/module';
import serializedReferenceModule from './serializedreference/serializedreference_module';
import {sparklineComponent} from './sparkline/component';
import toggleHiddenTextModule from './togglehiddentext/togglehiddentext_module';
import warnThresholdDirective from './warnthreshold/warnthreshold_directive';
import {zeroStateComponent} from './zerostate/component';

/**
 * Module containing common components for the application.
 */
export default angular
    .module(
        'kubernetesDashboard.common.components',
        [
          'ngMaterial',
          'ui.router',
          filtersModule.name,
          actionbarModule.name,
          contentCardModule.name,
          endpointModule.name,
          infoCardModule.name,
          resourceDetailModule.name,
          resourceCardModule.name,
          paginationModule.name,
          namespaceModule.name,
          stateModule.name,
          graphModule.name,
          conditionsModule.name,
          serializedReferenceModule.name,
          annotationsModule.name,
          toggleHiddenTextModule.name,
        ])
    .component('kdLabels', labelComponent)
    .component('kdZeroState', zeroStateComponent)
    .component('kdMiddleEllipsis', middleEllipsisComponent)
    .component('kdSparkline', sparklineComponent)
    .directive('kdWarnThreshold', warnThresholdDirective);
