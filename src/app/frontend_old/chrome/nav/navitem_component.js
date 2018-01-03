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
 * @final
 */
export class NavItemController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!./nav_service.NavService} kdNavService
   * @ngInject
   */
  constructor($state, kdNavService) {
    /** @export {string} */
    this.state;

    /** @export {string} */
    this.href;

    /** @export {boolean} */
    this.active;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./nav_service.NavService} */
    this.kdNavService_ = kdNavService;
  }

  /** @export */
  $onInit() {
    this.kdNavService_.registerState(this.state);
  }

  /**
   * Returns reference link for menu entries. By default default href for state will be returned, it
   * can be overwritten by passing 'href' to the component.
   *
   * @return {string}
   * @export
   */
  getHref() {
    return this.href ? this.href : this.state_.href(this.state);
  }

  /**
   * Returns true if current state is active and menu entry should be highlighted. By default uses
   * navigation service, but can be overwritten by passing 'active' to the component.
   *
   * @return {boolean}
   * @export
   */
  isActive() {
    return this.active !== undefined ? this.active : this.kdNavService_.isActive(this.state);
  }
}

/**
 * @type {!angular.Component}
 */
export const navItemComponent = {
  controller: NavItemController,
  bindings: {
    'state': '@',
    'href': '@',
    'active': '=',
  },
  transclude: true,
  templateUrl: 'chrome/nav/navitem.html',
};
