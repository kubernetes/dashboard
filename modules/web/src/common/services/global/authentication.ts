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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {IConfig} from '@api/root.ui';
import {CookieService} from 'ngx-cookie-service';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {AuthResponse, CsrfToken, LoginSpec, User} from 'typings/root.api';
import {CONFIG_DI_TOKEN} from '../../../index.config';
import {CsrfTokenService} from './csrftoken';
import {KdStateService} from './state';
import isEmpty from 'lodash-es/isEmpty';
import {MeService} from '@common/services/global/me';

@Injectable()
export class AuthService {
  private _hasAuthHeader = false;

  constructor(
    private readonly cookies_: CookieService,
    private readonly router_: Router,
    private readonly http_: HttpClient,
    private readonly csrfTokenService_: CsrfTokenService,
    private readonly stateService_: KdStateService,
    private readonly _meService: MeService,
    @Inject(CONFIG_DI_TOKEN) private readonly config_: IConfig
  ) {
    this.stateService_.onBefore.subscribe(_ => this.refreshToken());
  }

  /**
   * Sends a login request to the backend with filled in login spec structure.
   */
  login(loginSpec: LoginSpec): Observable<User> {
    return this.csrfTokenService_
      .getTokenForAction('login')
      .pipe(
        switchMap((csrfToken: CsrfToken) =>
          this.http_.post<AuthResponse>('api/v1/login', loginSpec, {
            headers: new HttpHeaders().set(this.config_.csrfHeaderName, csrfToken.token),
          })
        )
      )
      .pipe(
        switchMap((authResponse: AuthResponse) => {
          if (authResponse.token.length !== 0) {
            this.setTokenCookie_(authResponse.token);
          }

          return this._meService.refresh();
        })
      );
  }

  logout(): void {
    this.removeTokenCookie();
    this._meService.reset();
    this.router_.navigate(['login']);
  }

  /**
   * Sends a token refresh request to the backend. In case a user is not logged in with token, nothing will happen.
   */
  refreshToken(): void {
    // const token = this.getTokenCookie_();
    // if (token.length === 0) return;
    //
    // this.csrfTokenService_
    //   .getTokenForAction('token')
    //   .pipe(
    //     switchMap(csrfToken => {
    //       return this.http_.post<AuthResponse>(
    //         'api/v1/token/refresh',
    //         {jweToken: token},
    //         {
    //           headers: new HttpHeaders().set(this.config_.csrfHeaderName, csrfToken.token),
    //         }
    //       );
    //     })
    //   )
    //   .pipe(take(1))
    //   .subscribe((authResponse: AuthResponse) => {
    //     if (authResponse.token.length !== 0) {
    //       this.setTokenCookie_(authResponse.token);
    //     }
    //   });
  }

  isAuthenticated(): boolean {
    return this._meService.getUser().authenticated || this.hasTokenCookie();
  }

  hasAuthHeader(): boolean {
    return this._meService.getUser().authenticated && !this.hasTokenCookie();
  }

  private getTokenCookie(): string {
    return this.cookies_.get(this.config_.authTokenCookieName) || '';
  }

  hasTokenCookie(): boolean {
    return !isEmpty(this.getTokenCookie());
  }

  private setTokenCookie_(token: string): void {
    if (this.isCurrentProtocolSecure_()) {
      this.cookies_.set(this.config_.authTokenCookieName, token, null, null, null, true, 'Strict');
      return;
    }

    if (this.isCurrentDomainSecure_()) {
      this.cookies_.set(this.config_.authTokenCookieName, token, null, null, location.hostname, false, 'Strict');
    }
  }

  removeTokenCookie(): void {
    if (this.isCurrentProtocolSecure_()) {
      this.cookies_.delete(this.config_.authTokenCookieName, null, null, true, 'Strict');
      return;
    }

    if (this.isCurrentDomainSecure_()) {
      this.cookies_.delete(this.config_.authTokenCookieName, null, location.hostname, false, 'Strict');
    }
  }

  private isCurrentDomainSecure_(): boolean {
    return ['localhost', '127.0.0.1'].indexOf(location.hostname) > -1;
  }

  private isCurrentProtocolSecure_(): boolean {
    return location.protocol.includes('https');
  }
}
