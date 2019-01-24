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

import {Component, Input, OnInit} from '@angular/core';
import {Breadcrumb} from '@api/frontendapi';
import {StateDeclaration, StateObject, StateService, TransitionService} from '@uirouter/core';
import {BreadcrumbsService} from '../../services/global/breadcrumbs';

/**
 * Should be used only within actionbar component.
 *
 * In order to define custom label for the state add: `'kdBreadcrumbs':{'label':'myLabel'}`
 * to the state config. This label will be used instead of default state name when displaying
 * breadcrumbs.
 *
 * In order to define custom parent for the state add: `'kdBreadcrumbs`:{'parent':'myParentState'}`
 * to the state config. Parent state will be looked up by this name if it's defined.
 *
 * Additionally labels can be interpolated. This applies only to the last state in the
 * breadcrumb chain, i.e. for given state chain `StateA > StateB > StateC`, only StateC can use
 * following convention: `'kdBreadcrumbs`:{'label':'paramX'}`. Note that 'paramX' has to be a part
 * of state params object to be correctly interpolated.
 *
 * Example state config:
 * $stateProvider.state(stateName, {
 *   url: '...',
 *   data: {
 *      'kdBreadcrumbs': {
 *        'label': 'paramX',
 *        'parent': 'parentState',
 *      },
 *   },
 *   views: {
 *     '': {
 *       controller: SomeCtrlA,
 *       controllerAs: 'ctrl',
 *       templateUrl: '...',
 *     },
 *     'actionbar': {
 *       controller: SomeCtrlB,
 *       controllerAs: 'ctrl',
 *       templateUrl: '...',
 *     },
 *   },
 * });
 */
@Component({
  selector: 'kd-breadcrumbs',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  @Input() limit: number;
  breadcrumbs: Breadcrumb[];
  constructor(
      private readonly state_: StateService, private readonly transition_: TransitionService,
      private readonly breadcrumbs_: BreadcrumbsService) {}

  ngOnInit(): void {
    this.initBreadcrumbs_();
    this.transition_.onSuccess({}, () => {
      this.initBreadcrumbs_();
    });
  }

  /** Initializes breadcrumbs array by traversing states parents until none is found. */
  initBreadcrumbs_(): void {
    let state: StateObject|StateDeclaration = this.state_.$current;
    const breadcrumbs: Breadcrumb[] = [];

    while (state && state.name && this.canAddBreadcrumb_(breadcrumbs)) {
      const breadcrumb = this.getBreadcrumb_(state);

      if (breadcrumb.label) {
        breadcrumbs.push(breadcrumb);
      }

      state = this.breadcrumbs_.getParentState(state);
    }

    this.breadcrumbs = breadcrumbs.reverse();
  }

  /**
   * Returns true if limit is undefined or limit is defined and breadcrumbs count is smaller or
   * equal to the limit.
   */
  private canAddBreadcrumb_(breadcrumbs: Breadcrumb[]): boolean {
    return this.limit === undefined || this.limit > breadcrumbs.length;
  }

  private getBreadcrumb_(state: StateObject|StateDeclaration): Breadcrumb {
    const breadcrumb = new Breadcrumb();

    breadcrumb.label = this.breadcrumbs_.getDisplayName(state);
    breadcrumb.stateLink = this.state_.href(state.name, this.state_.params);

    return breadcrumb;
  }
}
