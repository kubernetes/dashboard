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

import {DataSelectQueryBuilder, SortableProperties} from './builder';

/** @const {!DataSelectApi.SupportedActions} **/
const Actions = {
  /** @export */
  PAGINATE: 0,
  /** @export */
  SORT: 1,
  /** @export */
  FILTER: 2,
};

/**
 * @final
 */
export class DataSelectService {
  /**
   * @param {!./../namespace/service.NamespaceService} kdNamespaceService
   * @param {!./../settings/service.SettingsService} kdSettingsService
   * @param {!searchApi.StateParams|!../../chrome/state.StateParams|!../resource/resourcedetail.StateParams} $stateParams
   * @param {!{setCurrentPage: function(string, number)}} paginationService
   * @ngInject
   */
  constructor(kdNamespaceService, kdSettingsService, $stateParams, paginationService) {
    /** @private {!Map<string, !DataSelectApi.DataSelectQuery>} */
    this.instances_ = new Map();

    /** @private {!./../namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @private {!./../settings/service.SettingsService} */
    this.settingsService_ = kdSettingsService;

    /** @export {!DataSelectApi.SupportedActions} **/
    this.actions_ = Actions;

    /**
     * {!searchApi.StateParams|!../../../chrome/chrome_state.StateParams|!../../resource/resourcedetail.StateParams}
     */
    this.stateParams_ = $stateParams;

    /** @private {!{setCurrentPage: function(string, number)}} */
    this.paginationService_ = paginationService;
  }

  /**
   * Returns true if given data select id is registered, false otherwise.
   *
   * @param {string} dataSelectId
   * @return {boolean}
   * @export
   */
  isRegistered(dataSelectId) {
    return this.instances_.has(dataSelectId);
  }

  /**
   * Registers data select query instance for given data select id.
   *
   * @param {string} dataSelectId
   * @export
   */
  registerInstance(dataSelectId) {
    this.instances_.set(dataSelectId, this.newDataSelectQueryBuilder().build());
  }

  /**
   * @param {string} dataSelectId
   * @private
   */
  resetPagination_(dataSelectId) {
    this.paginationService_.setCurrentPage(dataSelectId, 1);
  }

  /**
   * @param {!angular.$resource} listResource
   * @param {string} dataSelectId
   * @param {!DataSelectApi.DataSelectQuery} dataSelectQuery
   * @param {number} action
   * @return {!angular.$q.Promise}
   * @private
   */
  selectData_(listResource, dataSelectId, dataSelectQuery, action) {
    let query = this.instances_.get(dataSelectId);
    let name = this.stateParams_.objectName || query.name;
    let namespace =
        this.stateParams_.objectNamespace || this.stateParams_.namespace || query.namespace;

    if (!query) {
      throw new Error(`Data select query for given data select id ${dataSelectId} does not exist`);
    }

    if (this.kdNamespaceService_.isMultiNamespace(namespace)) {
      namespace = '';
    }

    query.name = dataSelectQuery.name || name;
    query.namespace = dataSelectQuery.namespace || namespace;

    switch (action) {
      case this.actions_.PAGINATE:
        query.itemsPerPage = dataSelectQuery.itemsPerPage;
        query.page = dataSelectQuery.page;
        break;
      case this.actions_.SORT:
        query.sortBy = dataSelectQuery.sortBy;
        break;
      case this.actions_.FILTER:
        query.filterBy = dataSelectQuery.filterBy;
        query.page = 1;
        this.resetPagination_(dataSelectId);
    }

    this.instances_.set(dataSelectId, query);

    query = this.applySearch_(query);

    return listResource.get(query).$promise;
  }

  /**
   * @param {!DataSelectApi.DataSelectQuery} query
   * @private
   */
  applySearch_(query) {
    if (this.stateParams_.q) {
      if (query.filterBy) {
        query.filterBy += ',';
      }
      query.filterBy += `name,${this.stateParams_.q}`;
    }
    return query;
  }

  /**
   * @param {!angular.$resource} listResource
   * @param {string} dataSelectId
   * @param {!DataSelectApi.DataSelectQuery} dataSelectQuery
   * @return {!angular.$q.Promise}
   * @export
   */
  paginate(listResource, dataSelectId, dataSelectQuery) {
    return this.selectData_(listResource, dataSelectId, dataSelectQuery, this.actions_.PAGINATE);
  }

  /**
   * @param {!angular.$resource} listResource
   * @param {string} dataSelectId
   * @param {boolean} ascending
   * @param {string} sortBy
   * @return {!angular.$q.Promise}
   * @export
   */
  sort(listResource, dataSelectId, ascending, sortBy) {
    if (sortBy === SortableProperties.AGE) {
      // Flip sorting because by sorting is done based on creation timestamp.
      ascending = !ascending;
    }

    let dataSelectQuery =
        this.newDataSelectQueryBuilder().setAscending(ascending).setSortBy(sortBy).build();
    return this.selectData_(listResource, dataSelectId, dataSelectQuery, this.actions_.SORT);
  }

  /**
   * @param {!angular.$resource} listResource
   * @param {string} dataSelectId
   * @param {string} filterBy
   * @return {!angular.$q.Promise}
   * @export
   */
  filter(listResource, dataSelectId, filterBy) {
    let dataSelectQuery = this.newDataSelectQueryBuilder().setFilterBy(filterBy).build();
    return this.selectData_(listResource, dataSelectId, dataSelectQuery, this.actions_.FILTER);
  }

  /**
   * @param {string|undefined} [namespace]
   * @param {string|undefined} [name]
   * @return {!DataSelectApi.DataSelectQuery}
   * @export
   */
  getDefaultResourceQuery(namespace, name) {
    namespace = namespace || '';
    name = name || '';
    let query = this.newDataSelectQueryBuilder().setNamespace(namespace).setName(name).build();

    if (this.kdNamespaceService_.isMultiNamespace(query.namespace)) {
      query.namespace = '';
    }

    return query;
  }

  /**
   * @return {DataSelectQueryBuilder}
   * @export
   */
  newDataSelectQueryBuilder() {
    return new DataSelectQueryBuilder(this.settingsService_.getItemsPerPage());
  }
}
