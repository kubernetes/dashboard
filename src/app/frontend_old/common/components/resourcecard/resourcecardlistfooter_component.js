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

const PAGINATION_SLOT = 'pagination';

class ResourceCardListFooterController {
  /**
   * @param {!angular.JQLite} $element
   * @ngInject
   */
  constructor($element) {
    /** @private {!angular.JQLite} */
    this.element_ = $element;
  }

  /**
   * To avoid issue with duplicated bottom border on resource cards described in #1893 following
   * function was added. Thanks to it footer border will not be displayed until there are pagination
   * controls (this means, that footer is actually displayed).
   *
   * @export
   * @return {boolean}
   */
  isBottomBorderVisible() {
    return this.element_[0].innerHTML.indexOf('dir-pagination-controls') > 0;
  }
}

/**
 * Resource card list footer component. See resource card for documentation.
 * @type {!angular.Component}
 */
export const resourceCardListFooterComponent = {
  controller: ResourceCardListFooterController,
  templateUrl: 'common/components/resourcecard/resourcecardlistfooter.html',
  transclude: {
    [PAGINATION_SLOT]: '?kdResourceCardListPagination',
  },
};
