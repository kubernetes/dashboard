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
import {ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
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
  constructor(private readonly router_: Router, private readonly breadcrumbs_: BreadcrumbsService) {
  }

  ngOnInit(): void {
    this.initBreadcrumbs_();
    // this.transition_.onSuccess({}, () => {
    //   this.initBreadcrumbs_();
    // });
  }

  /** Initializes breadcrumbs array by traversing states parents until none is found. */
  initBreadcrumbs_(): void {
    // let state: ActivatedRouteSnapshot = this.router_.routerState.root.snapshot;
    // const breadcrumbs: Breadcrumb[] = [];
    //
    // while (state && state.url && this.canAddBreadcrumb_(breadcrumbs)) {
    //   const breadcrumb = this.getBreadcrumb_(state);
    //
    //   if (breadcrumb.label) {
    //     breadcrumbs.push(breadcrumb);
    //   }
    //
    //   state = this.breadcrumbs_.getParentState(state).snapshot;
    // }
    //
    // this.breadcrumbs = breadcrumbs.reverse();
  }

  /**
   * Returns true if limit is undefined or limit is defined and breadcrumbs count is smaller or
   * equal to the limit.
   */
  private canAddBreadcrumb_(breadcrumbs: Breadcrumb[]): boolean {
    return this.limit === undefined || this.limit > breadcrumbs.length;
  }

  private getBreadcrumb_(state: ActivatedRouteSnapshot): Breadcrumb {
    const breadcrumb = new Breadcrumb();

    if (state) {
    }
    // breadcrumb.label = this.breadcrumbs_.getDisplayName(state);
    // breadcrumb.stateLink = this.router_.href(state.name, this.router_.params);

    return breadcrumb;
  }
}

// breadcrumbs = this._router.events
//   .filter(event => event instanceof NavigationEnd)
//   .distinctUntilChanged()
//   .map(() => this._buildBreadCrumb(this._activatedRoute.root));
//
// constructor(private readonly _router: Router, private readonly _activatedRoute: ActivatedRoute)
// {}
//
// _buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []):
// Breadcrumb[] {
//   const label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data[
//   'breadcrumb' ] : 'Home'; const nextUrl = `${url}${route.routeConfig ? route.routeConfig.path :
//   ''}/`; breadcrumbs.push({label: label, stateLink: nextUrl}); return route.firstChild ?
//   this._buildBreadCrumb(route.firstChild, nextUrl, breadcrumbs) : breadcrumbs;
// }
