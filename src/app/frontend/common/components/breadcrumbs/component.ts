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

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Breadcrumb} from '@api/frontendapi';

@Component({
  selector: 'kd-breadcrumbs',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: Breadcrumb[];

  constructor(private readonly _router: Router, private readonly _activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this._registerNavigationHook();
  }

  private _registerNavigationHook(): void {
    this._router.events.filter(event => event instanceof NavigationEnd)
        .distinctUntilChanged()
        .subscribe(() => {
          this._initBreadcrumbs();
        });
  }

  private _initBreadcrumbs(): void {
    this.breadcrumbs = [];

    let route = this._getCurrentRoute();
    while (route) {
      this.breadcrumbs.push(this._toBreadcrumb(route));

      console.log(route);
      route = route.parent;
    }

    this.breadcrumbs.reverse();
  }

  private _getCurrentRoute(): ActivatedRoute {
    let route = this._activatedRoute.root;
    while (route && route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  // TODO:
  //  - Add data to all structures.
  //  - Fill stateLink field.
  private _toBreadcrumb(route: ActivatedRoute): Breadcrumb {
    return {
      label: this._getBreadcrumbLabel(route),
      stateLink: '',
    } as Breadcrumb;
  }

  // TODO: When state search is active use specific logic to display custom breadcrumb:
  //  if (state.url[0].path === searchState.name) {
  //    const query = stateParams[SEARCH_QUERY_STATE_PARAM];
  //    return `Search for "${query}"`;
  //  }
  private _getBreadcrumbLabel(route: ActivatedRoute) {
    if (route.routeConfig && route.routeConfig.data && route.routeConfig.data.label) {
      if (route.routeConfig.data.useLabelAsParam) {
        // If useLabelAsParam is true, then use label to search for params and display the name.
        // It will be used to display resource names in the detail routes.
        return route.snapshot.params[route.routeConfig.data.label];
      } else {
        return route.routeConfig.data.label;
      }
    } else if (route.routeConfig && route.routeConfig.component) {
      return route.routeConfig.component.name;
    } else {
      return 'Unknown';
    }
  }
}
