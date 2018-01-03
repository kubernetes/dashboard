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

import {namespaceParam} from '../../chrome/state';
import {showNamespaceChangeInfoDialog} from './dialog';

/**
 * Internal key for empty selection. To differentiate empty string from nulls.
 * @type {string}
 */
export const ALL_NAMESPACES = '_all';

/**
 * Default namespace.
 * @type {string}
 */
export const DEFAULT_NAMESPACE = 'default';

/**
 * Regular expression for namespace validation.
 * @type {RegExp}
 */
export const NAMESPACE_REGEX = /^([a-z0-9]([-a-z0-9]*[a-z0-9])?|_all)$/;

/**
 * @final
 */
export class NamespaceSelectController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!ui.router.$state} $state
   * @param {!angular.Scope} $scope
   * @param {!./../state/service.FutureStateService} kdFutureStateService
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.JQLite} $element
   * @param {!angular.$timeout} $timeout
   * @param {!md.$select} $mdSelect
   * @param {!angular.$document} $document
   * @ngInject
   */
  constructor(
      $resource, $state, $scope, kdFutureStateService, $mdDialog, $element, $timeout, $mdSelect,
      $document) {
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

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.Scope} */
    this.scope_ = $scope;

    /** @private {!./../state/service.FutureStateService}} */
    this.futureStateService_ = kdFutureStateService;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @export */
    this.i18n = i18n;

    /** @export {string} */
    this.namespaceInput;

    /** @private {!angular.JQLite} */
    this.element_ = $element;

    /** @private {!angular.$timeout} */
    this.timeout_ = $timeout;

    /** @private {!md.$select} */
    this.mdSelect_ = $mdSelect;

    /** @private {!angular.$document} */
    this.document_ = $document;
  }

  /** @export */
  $onInit() {
    // Disable event propagation on select menu to allow typing in input field.
    this.element_.find('input').on('keydown', (ev) => {
      ev.stopPropagation();
    });

    this.onNamespaceChanged_(this.futureStateService_.params);

    this.scope_.$watch(() => this.futureStateService_.params, (toParams) => {
      this.onNamespaceChanged_(toParams);
    });
  }

  /** @export */
  selectNamespace() {
    if (this.namespaceInput.length > 0) {
      this.selectedNamespace = this.namespaceInput;
      this.clearNamespaceInput_();
      this.mdSelect_.hide();
      this.state_.go('.', {[namespaceParam]: this.selectedNamespace});
    }
  }

  /**
   * Dialog should be shown if user is on details page (toParams.objectNamespace), not all
   * namespaces are selected (toParams.namespace !== "_all") and current object namespace is
   * different than selected namespace (toParams.namespace !== toParams.objectNamespace).
   *
   * @param {Object<string, string>} toParams
   * @return {boolean}
   * @private
   */
  shouldShowNamespaceChangeDialog_(toParams) {
    return toParams && toParams.namespace && toParams.objectNamespace &&
        toParams.namespace !== '_all' && toParams.namespace !== toParams.objectNamespace;
  }

  /**
   * When namespace is changed perform basic validation (check existence etc.). At the end check if
   * redirect to list view should happen.
   *
   * @param {Object<string, string>} toParams
   * @private
   */
  onNamespaceChanged_(toParams) {
    if (toParams) {
      /** @type {?string} */
      let newNamespace = toParams[namespaceParam];
      if (newNamespace) {
        if (this.namespacesInitialized_ && this.namespaces.length > 0) {
          if (this.namespaces.indexOf(newNamespace) >= 0 || newNamespace === ALL_NAMESPACES) {
            this.selectedNamespace = newNamespace;
          } else {
            this.selectedNamespace = DEFAULT_NAMESPACE;
          }
        } else {
          if (NAMESPACE_REGEX.test(newNamespace)) {
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

    if (this.shouldShowNamespaceChangeDialog_(toParams)) {
      this.handleNamespaceChangeDialog_(toParams);
    }
  }

  /**
   * @param {Object<string, string>} toParams
   * @private
   */
  handleNamespaceChangeDialog_(toParams) {
    showNamespaceChangeInfoDialog(this.mdDialog_, toParams.objectNamespace);
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

  /** @export */
  changeNamespace() {
    this.clearNamespaceInput_();
    this.state_.go('.', {[namespaceParam]: this.selectedNamespace});
  }

  /** @export */
  loadNamespacesIfNeeded() {
    this.focusNamespaceInput_();
    if (!this.namespacesInitialized_) {
      /** @type {!angular.Resource} */
      let resource = this.resource_('api/v1/namespace');

      return resource.get().$promise.then((/** !backendApi.NamespaceList */ namespaceList) => {
        this.namespaces = namespaceList.namespaces.map((n) => n.objectMeta.name);
        this.namespacesInitialized_ = true;
      });
    }
  }

  /**
   * Focuses namespace input field after clicking on namespace selector menu.
   *
   * @private
   */
  focusNamespaceInput_() {
    // Wrap in a timeout to make sure that element is rendered before looking for it.
    this.timeout_(() => {
      let elem = this.document_.find('md-select-menu').find('input');
      elem[0].focus();
    }, 150);
  }

  /** @private */
  clearNamespaceInput_() {
    this.namespaceInput = '';
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
