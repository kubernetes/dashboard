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

import Breadcrumb from './breadcrumb';

/**
 * @final
 */
export default class BreadcrumbsController {
  /**
   * Constructs breadcrumbs controller.
   *
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($state, $interpolate) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;
    /** @export {number} - Initialized from template */
    this.limit;
    /** @export {string} - Initialized from template */
    this.separator;
    /** @export {!Array<!Breadcrumb>} - Used in template */
    this.breadcrumbs = this.initBreadcrumbs();
  }

  /**
   * Initializes breadcrumbs array by traversing states parents until none is found.
   *
   * @return {!Array<!Breadcrumb>}
   * @private
   */
  initBreadcrumbs() {
    /** @type {!ui.router.$state} */
    let state = this.state_['$current'];
    /** @type {!Array<!Breadcrumb>} */
    let breadcrumbs = [];

    while (state && state['name'] && this.canAddBreadcrumb(breadcrumbs)) {
      /** @type {!Breadcrumb} */
      let breadcrumb = this.getBreadcrumb(state);

      if (breadcrumb.label) {
        breadcrumbs.push(breadcrumb);
      }

      state = this.getParentState(state);
    }

    return breadcrumbs.reverse();
  }

  /**
   * Returns true if limit is undefined or limit is defined and breadcrumbs count is smaller or
   * equal to the limit.
   *
   * @param {!Array<!Breadcrumb>} breadcrumbs
   * @return {boolean}
   * @private
   */
  canAddBreadcrumb(breadcrumbs) {
    return this.limit === undefined || this.limit > breadcrumbs.length;
  }

  /**
   * Returns parent state of the given state based on defined state parent name or if it is not
   * defined then based on direct parent state.
   *
   * @param {!ui.router.$state} state
   * @return {!ui.router.$state}
   * @private
   */
  getParentState(state) {
    let conf = state['kdBreadcrumbs'];
    let result = state['parent'];

    if (!!conf && !!conf.parent) {
      result = this.state_.get(conf.parent);
    }

    return result;
  }

  /**
   * Creates breadcrumb object based on state object.
   *
   * @param {!ui.router.$state} state
   * @return {!Breadcrumb}
   * @private
   */
  getBreadcrumb(state) {
    let breadcrumb = new Breadcrumb();

    breadcrumb.label = this.getDisplayName(state);
    breadcrumb.stateLink = this.state_.href(state['name']);

    return breadcrumb;
  }

  /**
   * Returns display name for given state.
   *
   * If label for the state is defined it is interpolated against given state default view scope.
   * If interpolation fails then given label string is returned.
   * If label string is empty then state name is returned.
   *
   * @param {!ui.router.$state} state
   * @returns {string}
   * @private
   */
  getDisplayName(state) {
    let conf = state['kdBreadcrumbs'];
    let areLocalsDefined = !!state['locals'];
    let interpolationContext = state;

    // When conf is undefined and label is undefined or empty then fallback to state name
    if (!conf || !conf.label) {
      return state['name'];
    }

    if (areLocalsDefined) {
      // Set context to default view scope
      interpolationContext = state['locals']['@'];
    }

    return this.interpolate_(conf.label)(interpolationContext).toString();
  }
}
