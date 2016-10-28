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

import {namespaceParam} from 'chrome/chrome_state';

/** Internal key for empty selection. To differentiate empty string from nulls. */
export const ALL_NAMESPACES = '_all';

export const DEFAULT_NAMESPACE = 'default';

export const NAMESPACE_REGEX = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?|_all)$/;

/**
 * @final
 */
export class NamespaceSelectController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!ui.router.$state} $state
   * @param {!angular.Scope} $scope
   * @param {!./namespace_service.NamespaceService} kdNamespaceService
   * @param {!./../state/futurestate_service.FutureStateService} kdFutureStateService
   * @ngInject
   */
  constructor($resource, $state, $scope, kdNamespaceService, kdFutureStateService) {
    /**
     * Initialized with all namespaces on first open.
     * @export {!Array<string>}
     */
    this.namespaces = [];

    /** @export {string} */
    this.ALL_NAMESPACES = ALL_NAMESPACES;

    /**
     * Whether the list of namespaces has been initialized from the backend.
     * @private {boolean}
     */
    this.namespacesInitialized_ = false;

    /**
     * Namespace that is selected in the select component.
     * @export {string}
     */
    this.selectedNamespace;

    /**
     * @private {!./namespace_service.NamespaceService}
     */
    this.namespaceService_ = kdNamespaceService;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.Scope} */
    this.scope_ = $scope;

    /** @private {!./../state/futurestate_service.FutureStateService}} */
    this.kdFutureStateService_ = kdFutureStateService;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @export
   */
  $onInit() {
    this.onNamespaceChanged_(this.kdFutureStateService_.params);

    this.scope_.$watch(() => this.kdFutureStateService_.params, (toParams) => {
      this.onNamespaceChanged_(toParams);
    });
  }

  /**
   * @param {Object<string, string>} toParams
   * @private
   */
  onNamespaceChanged_(toParams) {
    if (toParams) {
      /** @type {?string} */
      let newNamespace = toParams[namespaceParam];
      if (newNamespace) {
        if (this.namespacesInitialized_) {
          if (this.namespaces.indexOf(newNamespace) >= 0 || newNamespace === ALL_NAMESPACES) {
            this.selectedNamespace = newNamespace;
          } else {
            this.selectedNamespace = DEFAULT_NAMESPACE;
          }
        } else {
          if (NAMESPACE_REGEX.test(newNamespace)) {
            this.namespaces = [newNamespace];
            this.selectedNamespace = newNamespace;
          } else {
            this.selectedNamespace = DEFAULT_NAMESPACE;
          }
        }
      } else {
        this.selectedNamespace = DEFAULT_NAMESPACE;
      }
    } else {
      this.selectedNamespace = DEFAULT_NAMESPACE;
    }
  }

  /**
   * @return {string}
   * @export
   */
  formatNamespace() {
    let namespace = this.selectedNamespace;
    if (namespace === ALL_NAMESPACES) {
      return this.i18n.MSG_ALL_NAMESPACES;
    } else {
      return namespace;
    }
  }

  /**
   * @export
   */
  changeNamespace() {
    this.state_.go('.', {[namespaceParam]: this.selectedNamespace});
  }

  /**
   * @export
   */
  loadNamespacesIfNeeded() {
    if (!this.namespacesInitialized_) {
      /** @type {!angular.Resource<!backendApi.NamespaceList>} */
      let resource = this.resource_('api/v1/namespace');

      return resource.get().$promise.then((/** !backendApi.NamespaceList */ namespaceList) => {
        this.namespaces = namespaceList.namespaces.map((n) => n.objectMeta.name);
        this.namespacesInitialized_ = true;
        if (this.namespaces.indexOf(this.selectedNamespace) === -1 &&
            this.selectedNamespace !== ALL_NAMESPACES) {
          this.selectedNamespace = DEFAULT_NAMESPACE;
          this.changeNamespace();
        }
      });
    }
  }
}

/**
 * @type {!angular.Component}
 */
export const namespaceSelectComponent = {
  controller: NamespaceSelectController,
  templateUrl: 'common/namespace/namespaceselect.html',
};

const i18n = {
  /** @export {string} @desc Text for dropdown item that indicates that no namespace was selected */
  MSG_ALL_NAMESPACES: goog.getMsg('All namespaces'),
  /** @export {string} @desc Text describing what namespace selector is */
  MSG_NAMESPACE_SELECT_ARIA_LABEL: goog.getMsg('Selector for namespaces'),
};
