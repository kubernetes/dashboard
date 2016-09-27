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

/** Available numbers of rows that can be shown on resource list. */
export const ROWS_LIMIT_OPTIONS = [10, 25, 50, 100];
/** Defines max number of rows that will be displayed on the list before applying pagination. */
export const DEFAULT_ROWS_LIMIT = 10;

/**
 * @final
 */
export class PaginationService {
  /**
  * @param {!./../namespace/namespace_service.NamespaceService} kdNamespaceService
  * @ngInject
  */
  constructor(kdNamespaceService) {
    /** @private {!Array<number>} */
    this.rowsLimitOptions_ = ROWS_LIMIT_OPTIONS;
    /** @private {!Map<string, number>} */
    this.instances_ = new Map();
    /** @private {!./../namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * Reset rows limit to default value.
   */
  resetRowsLimit() {
    this.instances_.forEach((val, key) => {
      this.instances_.set(key, DEFAULT_ROWS_LIMIT);
    });
  }

  /**
   * Returns true if given pagination id is registered, false otherwise.
   *
   * @param {string} paginationId
   * @return {boolean}
   */
  isRegistered(paginationId) {
    return this.instances_.has(paginationId);
  }

  /**
   * Registers pagination instance for given pagination id.
   *
   * @param {string} paginationId
   */
  registerInstance(paginationId) {
    this.instances_.set(paginationId, DEFAULT_ROWS_LIMIT);
  }

  /**
   * Returns number of rows that should be displayed on the list based on given pagination id.
   * If given id is not registered an error is thrown.
   *
   * @return {number}
   */
  getRowsLimit(paginationId) {
    let rowsLimit = this.instances_.get(paginationId);

    if (!rowsLimit) {
      throw new Error(`Pagination limit for given pagination id ${paginationId} does not exist`);
    }

    return rowsLimit;
  }

  /**
   *
   * @param limit
   * @param paginationId
   */
  setRowsLimit(limit, paginationId) {
    let rowsLimit = this.instances_.get(paginationId);

    if (!rowsLimit) {
      throw new Error(`Pagination limit for given pagination id ${paginationId} does not exist`);
    }

    if (this.rowsLimitOptions_.indexOf(limit) < 0) {
      throw new Error(`Limit has to be in range ${ROWS_LIMIT_OPTIONS}`);
    }

    this.instances_.set(paginationId, limit);
  }

  /**
   * Returns minimum available number of rows that can be displayed.
   *
   * @return {number}
   */
  getMinRowsLimit() {
    return Math.min.apply(Math, this.rowsLimitOptions_);
  }

  /**
   * Returns numbers of rows that can be shown on resource list.
   *
   * @return {!Array<number>}
   */
  getRowsLimitOptions() {
    return this.rowsLimitOptions_;
  }

  /**
   * @param {number} itemsPerPage
   * @param {number} pageNr
   * @param {string|undefined} [namespace]
   * @param {string|undefined} [name]
   * @return {!backendApi.PaginationQuery}
   */
  getResourceQuery(itemsPerPage, pageNr, namespace, name) {
    if (this.kdNamespaceService_.isMultiNamespace(namespace)) {
      namespace = '';
    }
    return {itemsPerPage: itemsPerPage, page: pageNr, namespace: namespace || '', name: name};
  }

  /**
   * @param {string|undefined} [namespace]
   * @param {string|undefined} [name]
   * @return {!backendApi.PaginationQuery}
   */
  getDefaultResourceQuery(namespace, name) {
    return this.getResourceQuery(DEFAULT_ROWS_LIMIT, 1, namespace, name);
  }
}
