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

/**
 * @final
 */
export class ReplicaSetCardListController {
  /**
   * @param {!../common/pagination/pagination_service.PaginationService} kdPaginationService
   * @ngInject
   */
  constructor(kdPaginationService) {
    /** @export {!Array<!backendApi.ReplicaSet>} Initialized from binding. */
    this.replicaSets;
    /** @export {!../common/pagination/pagination_service.PaginationService} */
    this.paginationService = kdPaginationService;
  }

  /**
   * @return {number}
   * @export
   */
  getRowsLimit() { return this.paginationService.getRowsLimit(); }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowFooter() { return this.replicaSets.length > this.paginationService.getRowsLimit(); }
}

/**
 * @return {!angular.Component}
 */
export const replicaSetCardListComponent = {
  transclude: true,
  bindings: {
    'replicaSets': '<',
  },
  templateUrl: 'replicasetlist/replicasetcardlist.html',
};
