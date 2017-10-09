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

import {stateName as defaultStateName} from '../../../overview/state';

/** Breadcrumbs config string used on state config. **/
export const breadcrumbsConfig = 'kdBreadcrumbs';

export class BreadcrumbsService {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    this.state_ = $state;
  }

  /**
   * Returns breadcrumb config object if it is defined on state, undefined otherwise.
   *
   * @param {!ui.router.$state} state
   * @return {Object}
   */
  getBreadcrumbConfig(state) {
    let conf = state['data'];

    if (conf) {
      conf = conf[breadcrumbsConfig];
    }

    return conf;
  }

  /**
   * Returns parent state of the given state based on defined breadcrumbs config state parent name.
   *
   * @param {!ui.router.$state} state
   * @return {!ui.router.$state}
   */
  getParentState(state) {
    let conf = this.getBreadcrumbConfig(state);
    let result = null;
    if (conf && conf.parent) {
      if (typeof conf.parent === 'string') {
        result = this.state_.get(conf.parent);
      } else {
        result = conf.parent;
      }
    }
    return result;
  }

  /**
   * Returns parent state name of the given state based on defined state parent name or if it is not
   * defined then default state name is returned.
   *
   * @param {!ui.router.$state} state
   * @return {string}
   */
  getParentStateName(state) {
    let conf = this.getBreadcrumbConfig(state);

    if (conf && conf.parent) {
      return conf.parent;
    }

    return defaultStateName;
  }
}
