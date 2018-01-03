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

/**
 * Controller for the resource card component.
 * @final
 */
export class ResourceCardController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Initialized from a binding.
     * @export {boolean}
     */
    this.omitMeta;

    /**
     * Initialized from a binding.
     * @export {!backendApi.ObjectMeta}
     */
    this.objectMeta;

    /**
     * Initialized from a binding.
     * @export {!backendApi.TypeMeta}
     */
    this.typeMeta;

    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardlist_component.ResourceCardListController}
     */
    this.resourceCardListCtrl;
  }

  /** @export */
  $onInit() {
    if (!this.omitMeta) {
      if (!this.objectMeta) {
        throw new Error('object-meta binding is required for resource card component');
      }

      if (!this.typeMeta) {
        throw new Error('type-meta binding is required for resource card component');
      }
    }
  }

  /**
   * @return {boolean}
   * @export
   */
  isSelectable() {
    return !!this.resourceCardListCtrl.selectable;
  }

  /**
   * @return {boolean}
   * @export
   */
  hasStatus() {
    return !!this.resourceCardListCtrl.withStatuses;
  }
}

/**
 * Represents a resource card in a tabularized list. Should always be used when showing
 * lists of resources. See resource card list component for documentation.
 * @type {!angular.Component}
 */
export const resourceCardComponent = {
  bindings: {
    /** type {boolean} Should be set to true if there is no object metadata. */
    'omitMeta': '<',
    /** type {!backendApi.ObjectMeta} Object metadata of the resource displayed in the card. */
    'objectMeta': '<',
    /** type {!backendApi.TypeMeta} Type metadata of the resource displayed in the card. */
    'typeMeta': '<',
  },
  controller: ResourceCardController,
  templateUrl: 'common/components/resourcecard/resourcecard.html',
  transclude: /** @type {undefined} TODO(bryk): Remove this when externs are fixed */ ({
    'status': '?kdResourceCardStatus',
    'columns': '?kdResourceCardColumns',
    'footer': '?kdResourceCardFooter',
  }),
  require: {
    'resourceCardListCtrl': '^kdResourceCardList',
  },
};
