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

import {StateParams} from '../../common/resource/resourcedetail';
import {stateName} from '../../secret/detail/state';

class SecretCardController {
  /**
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state, kdNamespaceService) {
    /** @export {!backendApi.Secret} Secret initialised from a bindig. */
    this.secret;


    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * @return {string}
   * @export
   */
  getSecretDetailHref() {
    return this.state_.href(
        stateName, new StateParams(this.secret.objectMeta.namespace, this.secret.objectMeta.name));
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * @type {!angular.Component}
 */
export const secretCardComponent = {
  bindings: {
    'secret': '=',
  },
  controller: SecretCardController,
  templateUrl: 'secret/list/card.html',
};
