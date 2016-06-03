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

import stateConfig from './joblist_stateconfig';
import filtersModule from 'common/filters/filters_module';
import componentsModule from 'common/components/components_module';
import {jobCardComponent} from './jobcard_component';
import {jobCardListComponent} from './jobcardlist_component';
import jobDetailModule from 'jobdetail/jobdetail_module';

/**
 * Angular module for the Job list view.
 *
 * The view shows Job running in the cluster and allows to manage them.
 */
export default angular.module('kubernetesDashboard.jobList',
                              [
                                'ngMaterial',
                                'ngResource',
                                'ui.router',
                                filtersModule.name,
                                componentsModule.name,
                                jobDetailModule.name,
                              ])
    .config(stateConfig)
    .component('kdJobCardList', jobCardListComponent)
    .component('kdJobCard', jobCardComponent);
