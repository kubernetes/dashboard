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

import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, Params, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {SearchComponent} from '../../../search/component';
import {SEARCH_QUERY_STATE_PARAM} from '../../params/params';

@Injectable()
export class SearchGuard implements CanDeactivate<SearchComponent> {
  private readonly queryParamSeparator_ = '&';
  private readonly queryParamStart_ = '?';

  constructor(private readonly router_: Router) {}

  canDeactivate(
    _cmp: SearchComponent,
    _route: ActivatedRouteSnapshot,
    _routeSnapshot: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean | UrlTree {
    let url = nextState.url;
    const queryParams = this.getQueryParams_(url);

    if (queryParams[SEARCH_QUERY_STATE_PARAM]) {
      url = this.removeQueryParamFromUrl_(url);
      return this.router_.parseUrl(url);
    }

    return true;
  }

  private getQueryParams_(url: string): Params {
    const paramMap: {[key: string]: string} = {};
    const queryStartIdx = url.indexOf(this.queryParamStart_) + 1;
    const partials = url.substring(queryStartIdx).split(this.queryParamSeparator_);

    for (const partial of partials) {
      const params = partial.split('=');
      if (params.length === 2) {
        paramMap[params[0]] = params[1];
      }
    }

    return paramMap;
  }

  private removeQueryParamFromUrl_(url: string): string {
    const queryStartIdx = url.indexOf(this.queryParamStart_) + 1;
    const rawUrl = url.substring(0, queryStartIdx - 1);

    const paramMap = this.getQueryParams_(url);
    if (paramMap[SEARCH_QUERY_STATE_PARAM]) {
      delete paramMap[SEARCH_QUERY_STATE_PARAM];
    }

    const queryParams = Object.keys(paramMap)
      .map(key => `${key}=${paramMap[key]}`)
      .join(this.queryParamSeparator_);
    return `${rawUrl}${this.queryParamStart_}${queryParams}`;
  }
}
