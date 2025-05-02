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
import {ActivatedRouteSnapshot, Router, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from '../global/authentication';
import {HistoryService} from '../global/history';

@Injectable()
export class AuthGuard {
  constructor(
    private readonly authService_: AuthService,
    private readonly router_: Router,
    private readonly historyService_: HistoryService
  ) {}

  canActivate(_root: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    if (!this.authService_.isAuthenticated()) {
      this.historyService_.pushState(this.router_.getCurrentNavigation());
      return of(this.router_.parseUrl('login'));
    }

    return of(true);
  }
}
