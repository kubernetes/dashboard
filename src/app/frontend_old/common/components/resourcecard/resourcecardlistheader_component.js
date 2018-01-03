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

const FILTER_SLOT = 'filter';
const TITLE_SLOT = 'title';

/**
 * @final
 */
class ResourceCardListHeaderController {
  /**
   * @param {!angular.$transclude} $transclude
   * @ngInject
   */
  constructor($transclude) {
    /** @private {!angular.$transclude} */
    this.transclude_ = $transclude;
  }

  /**
   * @export
   * @return {boolean}
   */
  isFilterSlotFilled() {
    return this.transclude_.isSlotFilled(FILTER_SLOT);
  }
}

/**
 * Resource card list header component. See resource card for documentation.
 * @type {!angular.Component}
 */
export const resourceCardListHeaderComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardlistheader.html',
  controller: ResourceCardListHeaderController,
  transclude: {
    [TITLE_SLOT]: '?kdResourceCardListTitle',
    [FILTER_SLOT]: '?kdResourceCardListFilter',
  },
};
