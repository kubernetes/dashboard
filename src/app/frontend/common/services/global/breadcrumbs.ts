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

import {Injectable} from '@angular/core';
import {BreadcrumbConfig} from '@api/frontendapi';
import {StateDeclaration, StateObject, StateService} from '@uirouter/core';

/** Breadcrumbs config string used on state config. **/
const breadcrumbsConfig = 'kdBreadcrumbs';

@Injectable()
export class BreadcrumbsService {
  constructor(private readonly state_: StateService) {}

  getBreadcrumbConfig_(state: StateObject|StateDeclaration): BreadcrumbConfig {
    return state.data ? state.data[breadcrumbsConfig] : state.data;
  }

  getDisplayName(state: StateObject|StateDeclaration): string {
    const conf = this.getBreadcrumbConfig_(state);
    const stateParams = this.state_.params;

    // When conf is undefined and label is undefined or empty then fallback to state name
    if (!conf || !conf.label) {
      return state.name;
    }

    // If there is a state parameter with with name equal to conf.label then return its value,
    // otherwise just return label. It allows to "interpolate" resource names into breadcrumbs.
    return stateParams && stateParams[conf.label] ? stateParams[conf.label] : conf.label;
  }
}
