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

import filtersModule from '../filters/module';

import dataSelectModule from './../dataselect/module';
import namespaceModule from './../namespace/module';
import actionbarModule from './actionbar/module';
import annotationsModule from './annotations/module';
import {conditionListComponent} from './conditions/component';
import {contentCardComponent} from './contentcard/component';
import endpointModule from './endpoint/module';
import graphModule from './graph/module';
import infoCardModule from './infocard/infocard_module';
import {labelComponent} from './labels/component';
import {middleEllipsisComponent} from './middleellipsis/component';
import resourceCardModule from './resourcecard/resourcecard_module';
import {infoCardComponent} from './resourcedetail/component';
import {serializedReferenceComponent} from './serializedreference/component';
import {sparklineComponent} from './sparkline/component';
import {toggleHiddenTextComponent} from './togglehiddentext/component';
import warnThresholdDirective from './warnthreshold/directive';
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
          endpointModule.name,
          infoCardModule.name,
          resourceCardModule.name,
          dataSelectModule.name,
          namespaceModule.name,
          stateModule.name,
          graphModule.name,
          annotationsModule.name,
        ])
    .component('kdLabels', labelComponent)
    .component('kdZeroState', zeroStateComponent)
    .component('kdMiddleEllipsis', middleEllipsisComponent)
    .component('kdSparkline', sparklineComponent)
    .component('kdToggleHiddenText', toggleHiddenTextComponent)
    .component('kdSerializedReference', serializedReferenceComponent)
    .component('kdObjectMetaInfoCard', infoCardComponent)
    .component('kdContentCard', contentCardComponent)
    .component('kdConditionList', conditionListComponent)
    .directive('kdWarnThreshold', warnThresholdDirective);
