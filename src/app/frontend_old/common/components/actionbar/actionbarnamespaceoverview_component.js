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

import {namespaceParam} from '../../../chrome/state';
import {stateName as overview} from '../../../overview/state';

export class ActionbarNamespaceOverviewController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @export {string} Initialized from a binding. */
    this.namespace;

    /** @private {!ui.router.$state}} */
    this.state_ = $state;
  }

  /** @export */
  goToNamespaceOverview() {
    this.state_.go(overview, {[namespaceParam]: this.namespace});
  }
}

/**
 * @type {!angular.Component}
 */
export const actionbarNamespaceOverviewComponent = {
  controller: ActionbarNamespaceOverviewController,
  templateUrl: 'common/components/actionbar/actionbarnamespaceoverview.html',
  bindings: {
    'namespace': '<',
  },
};
