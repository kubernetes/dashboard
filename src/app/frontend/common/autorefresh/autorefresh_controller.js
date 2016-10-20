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
 * Controller for the autorefresh directive.
 * @final
 */
export class AutoRefreshController {
  /**
   * @param {!./../../chrome/chrome_state.StateParams} $stateParams
   * @param {!./../pagination/pagination_service.PaginationService} kdPaginationService
   * @param {!./poll_service.PollService} kdPoll
   * @ngInject */
  constructor($stateParams, kdPaginationService, kdPoll) {
    /**
     * Initialized from the scope.
     * @export {!angular.$resource}
     */
    this.source;

    /**
     * Initialized from the scope.
     * @export {!Object}
     */
    this.target;

    /**
     * Initialized from the scope.
     * @export {!string}
     */
    this.type;

    /**
     * Initialized from the scope
     * @export {number}
     */
    this.delay;

    /**
     * Initialized from the scope
     * @export {!boolean}
     */
    this.namespace;

    /**
     * @type {!./poll_service.PollService}
     * @private
     */
    this.pollService_ = kdPoll;

    /**
     * @type {!./../../chrome/chrome_state.StateParams}
     * @private
     */
    this.stateParams_ = $stateParams;

    /**
     * @type {!./../pagination/pagination_service.PaginationService}
     * @private
     */
    this.kdPaginationService_ = kdPaginationService;

    this.startAutoRefresh_();
  }

  /**
   * Starts auto-refreshing according to settings
   * @private
   */
  startAutoRefresh_() {
    if (!this.type) {
      return this.startRefresh(this.source, this.target, null);
    }
    if (this.type.toLocaleLowerCase() === TYPE_LIST) {
      return this.startRefresh(this.source, this.target, this.createPaginationQueryWithNamespace());
    }
    if (this.type.toLocaleLowerCase() === TYPE_LIST_WITH_NO_NAMESPACE) {
      return this.startRefresh(this.source, this.target, this.createPaginationQuery());
    }
    return this.startRefresh(this.source, this.target, null);
  }

  /**
   * Starts auto refresh and returns notification promise for each update.
   * @param resource {!angular.Resource}
   * @param target {!Object}
   * @param params {angular.Resource.ParamsOrCallback=}
   * @return {!angular.$q.Promise}
   * @export
   */
  startRefresh(resource, target, params) {
    let promise = this.pollService_.poll(resource, params, this.delay);
    promise.then(null, null, (newObj) => {
      // Update target object with the new object.
      Object.assign(target, newObj);
    });
    return promise;
  }

  /**
   * Creates pagination default resource query with namespace parameter.
   * @return {!backendApi.PaginationQuery}
   * @export
   */
  createPaginationQueryWithNamespace() {
    return this.kdPaginationService_.getDefaultResourceQuery(this.stateParams_.namespace);
  }

  /**
   * Creates pagination default resource query.
   * @return {!backendApi.PaginationQuery}
   * @export
   */
  createPaginationQuery() {
    return this.kdPaginationService_.getDefaultResourceQuery();
  }
}

/** @type {number} */
export const DEFAULT_DELAY = 30000;
export const TYPE_LIST_WITH_NO_NAMESPACE = 'list-without-namespace';
export const TYPE_LIST = 'list';
