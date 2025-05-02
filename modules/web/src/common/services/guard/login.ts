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
import {Router, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from '../global/authentication';

@Injectable()
export class LoginGuard {
  constructor(
    private readonly _authService: AuthService,
    private readonly _router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // If user is already authenticated do not allow login view access.
    if (this._authService.isAuthenticated()) {
      return of(this._router.parseUrl('workloads'));
    }

    return of(true);
  }
}
