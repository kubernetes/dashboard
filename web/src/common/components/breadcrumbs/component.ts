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

import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Params, Route, Router} from '@angular/router';
import {Breadcrumb, IMessage} from '@api/root.ui';
import {distinctUntilChanged, filter} from 'rxjs/operators';
import {MESSAGES_DI_TOKEN} from '../../../index.messages';
import {POD_DETAIL_ROUTE} from '../../../resource/workloads/pod/routing';
import {REPLICASET_DETAIL_ROUTE} from '../../../resource/workloads/replicaset/routing';
import {REPLICATIONCONTROLLER_DETAIL_ROUTE} from '../../../resource/workloads/replicationcontroller/routing';
import {SEARCH_QUERY_STATE_PARAM} from '../../params/params';

export const LOGS_PARENT_PLACEHOLDER = '___LOGS_PARENT_PLACEHOLDER___';
export const EXEC_PARENT_PLACEHOLDER = '___EXEC_PARENT_PLACEHOLDER___';
export const SEARCH_BREADCRUMB_PLACEHOLDER = '___SEARCH_BREADCRUMB_PLACEHOLDER___';

@Component({
  selector: 'kd-breadcrumbs',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: Breadcrumb[];

  constructor(
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    @Inject(MESSAGES_DI_TOKEN) private readonly message_: IMessage
  ) {}

  ngOnInit(): void {
    this._initBreadcrumbs();
    this._registerNavigationHook();
  }

  private _registerNavigationHook(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this._initBreadcrumbs();
      });
  }

  private _initBreadcrumbs(): void {
    const currentRoute = this._getCurrentRoute();
    const url = this._router.url.includes('?') ? this._router.url.split('?')[0] : '';
    let urlArray = url.split('/');
    let routeParamsCount =
      currentRoute.routeConfig.data && currentRoute.routeConfig.data.routeParamsCount
        ? +currentRoute.routeConfig.data.routeParamsCount
        : currentRoute.routeConfig.path.split('/').length;

    this.breadcrumbs = [
      {
        label: this._getBreadcrumbLabel(currentRoute.routeConfig, currentRoute.snapshot.params),
        stateLink:
          currentRoute.routeConfig.data && currentRoute.routeConfig.data.link
            ? currentRoute.routeConfig.data.link
            : urlArray,
      },
    ];

    let route: Route;
    if (
      currentRoute &&
      currentRoute.routeConfig &&
      currentRoute.routeConfig.data &&
      currentRoute.routeConfig.data.parent
    ) {
      if (currentRoute.routeConfig.data.parent === LOGS_PARENT_PLACEHOLDER) {
        route = this._getLogsParent(currentRoute.snapshot.params);
        urlArray = ['', urlArray[urlArray.length - 1], urlArray[urlArray.length - 3], urlArray[urlArray.length - 2]];
        routeParamsCount = 0;
      } else if (currentRoute.routeConfig.data.parent === EXEC_PARENT_PLACEHOLDER) {
        route = POD_DETAIL_ROUTE;
        urlArray = ['', 'pod', urlArray[urlArray.length - 3], urlArray[urlArray.length - 2]];
        routeParamsCount = 0;
      } else {
        route = currentRoute.routeConfig.data.parent;
      }

      while (route) {
        // Trim URL by number of path parameters defined on previous route.
        urlArray = urlArray.slice(0, urlArray.length - routeParamsCount);
        routeParamsCount = route.path.split('/').length;

        this.breadcrumbs.push({
          label: this._getBreadcrumbLabel(route, currentRoute.snapshot.params),
          stateLink: route.data.link ? route.data.link : urlArray,
        });

        // Explore the route tree to the root route (parent references have to be defined by us on
        // each route).
        route = route?.data?.parent;
      }
    }

    this.breadcrumbs.reverse();
  }

  private _getLogsParent(params: Params): Route | undefined {
    const resourceType = params['resourceType'];
    if (resourceType === 'pod') {
      return POD_DETAIL_ROUTE;
    } else if (resourceType === 'replicationcontroller') {
      return REPLICATIONCONTROLLER_DETAIL_ROUTE;
    } else if (resourceType === 'replicaset') {
      return REPLICASET_DETAIL_ROUTE;
    }
    return undefined;
  }

  private _getCurrentRoute(): ActivatedRoute {
    let route = this._activatedRoute.root;
    while (route && route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private _getBreadcrumbLabel(route: Route, params: Params) {
    if (route && route.data && route.data.breadcrumb) {
      let breadcrumb = route.data.breadcrumb as string;
      if (breadcrumb.startsWith('{{') && breadcrumb.endsWith('}}')) {
        breadcrumb = breadcrumb.slice(2, breadcrumb.length - 2).trim();
        breadcrumb = params[breadcrumb];
      } else if (breadcrumb === SEARCH_BREADCRUMB_PLACEHOLDER) {
        return $localize`Search for ${this._activatedRoute.snapshot.queryParams[SEARCH_QUERY_STATE_PARAM]}`;
      }
      return breadcrumb;
    } else if (route && route.component) {
      return route.component.name;
    }
    return this.message_.Unknown;
  }
}
