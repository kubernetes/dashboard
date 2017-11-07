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

/** @const {!DataSelectApi.SortableProperties} **/
export const SortableProperties = {
  /** @export */
  NAME: 'name',
  /** @export */
  STATUS: 'status',
  /** @export */
  AGE: 'creationTimestamp',
};

/**
 * @final
 */
export class DataSelectQueryBuilder {
  /**
   * Initialized with default values. By default sort by age.
   *
   * @param {number} itemsPerPage
   * @export
   */
  constructor(itemsPerPage) {
    /** @private {number} */
    this.itemsPerPage_ = itemsPerPage;
    /** @private {number} */
    this.page_ = 1;
    /** @private {string} */
    this.sortBy_ = SortableProperties.AGE;
    /** @private {boolean} */
    this.ascending_;
    /** @private {string} */
    this.namespace_ = '';
    /** @private {string} */
    this.name_ = '';
    /** @private {string} */
    this.filterBy_ = '';

    return this;
  }

  /** @export */
  setItemsPerPage(itemsPerPage) {
    this.itemsPerPage_ = itemsPerPage;
    return this;
  }

  /** @export */
  setPage(page) {
    this.page_ = page;
    return this;
  }

  /** @export */
  setSortBy(sortBy) {
    this.sortBy_ = sortBy;
    return this;
  }

  /** @export */
  setAscending(ascending) {
    this.ascending_ = ascending;
    return this;
  }

  /**
   * @param {string} namespace
   * @export
   */
  setNamespace(namespace) {
    if (!namespace) {
      namespace = '';
    }

    this.namespace_ = namespace;
    return this;
  }

  /** @export */
  setName(name) {
    this.name_ = name;
    return this;
  }

  /** @export */
  setFilterBy(filterBy) {
    this.filterBy_ = filterBy;
    return this;
  }

  /**
   * @param {string} sortBy
   * @param {boolean} ascending
   * @return {string}
   * @private
   */
  getSortString_(sortBy, ascending) {
    return `${ascending ? 'a' : 'd'},${sortBy}`;
  }

  /**
   * Filter only by name property.
   * TODO(floreks): extend filtering to support more fields
   * @param {string} filterBy
   * @returns {string}
   * @private
   */
  getFilterString_(filterBy) {
    return filterBy.length > 0 ? `name,${filterBy}` : '';
  }

  /**
   * @return {!DataSelectApi.DataSelectQuery}
   * @export
   */
  build() {
    return {
      itemsPerPage: this.itemsPerPage_,
      page: this.page_,
      sortBy: this.getSortString_(this.sortBy_, this.ascending_),
      namespace: this.namespace_,
      name: this.name_,
      filterBy: this.getFilterString_(this.filterBy_),
    };
  }
}
