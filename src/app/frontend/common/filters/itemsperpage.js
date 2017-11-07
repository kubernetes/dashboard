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
 * Returns filter function that applies pagination on given collection by filtering out
 * redundant objects.
 *
 * @param {function(!Array<Object>, number, string): !Array<Object>} $delegate
 * @param {!../dataselect/service.DataSelectService} kdDataSelectService
 * @param {!../settings/service.SettingsService} kdSettingsService
 * @return {function(!Array<Object>, number, string): !Array<Object>}
 * @ngInject
 */
export default function itemsPerPageFilter($delegate, kdDataSelectService, kdSettingsService) {
  /** @type {function(!Array<Object>, number, string): !Array<Object>} */
  let sourceFilter = $delegate;

  /**
   * @param {!Array<Object>} collection
   * @param {number} itemsPerPage
   * @param {string} dataSelectId
   * @return {!Array<Object>}
   */
  let filterItems = function(collection, itemsPerPage, dataSelectId) {
    if (itemsPerPage === undefined) {
      if (!kdDataSelectService.isRegistered(dataSelectId)) {
        kdDataSelectService.registerInstance(dataSelectId);
      }

      return sourceFilter(collection, kdSettingsService.getItemsPerPage(), dataSelectId);
    }

    return sourceFilter(collection, itemsPerPage, dataSelectId);
  };

  return filterItems;
}
