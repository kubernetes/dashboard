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

import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {IConfig} from '@api/root.ui';
import {CookieService} from 'ngx-cookie-service';
import {Observable} from 'rxjs';
import {CONFIG_DI_TOKEN} from '../../../index.config';
import {AuthService} from '@common/services/global/authentication';
import {MeService} from '@common/services/global/me';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly cookies_: CookieService,
    private readonly _authService: AuthService,
    private readonly _meService: MeService,
    @Inject(CONFIG_DI_TOKEN) private readonly appConfig_: IConfig
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this._authService.isAuthenticated() && !this._authService.hasTokenCookie()) {
      return next.handle(req);
    }

    const token = this.cookies_.get(this.appConfig_.authTokenCookieName);
    // Filter requests made to our backend starting with 'api/v1' and append request header
    // with token stored in a cookie.
    if ((req.url.startsWith('api/v1') || req.url.startsWith('settings')) && !!token) {
      const authReq = req.clone({
        headers: req.headers.set(this.appConfig_.authTokenHeaderName, `Bearer ${token}`),
      });

      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
