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

import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {LoginStatus} from '@api/root.api';
import {IConfig} from '@api/root.ui';
import {AuthService} from '@common/services/global/authentication';
import {CookieService} from 'ngx-cookie-service';
import {CONFIG_DI_TOKEN} from '../../index.config';

@Component({
  selector: 'kd-user-panel',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
  host: {
    '[class.kd-hidden]': 'this.isAuthEnabled() === false',
  },
})
export class UserPanelComponent implements OnInit {
  @ViewChild(MatMenuTrigger)
  private readonly trigger_: MatMenuTrigger;

  loginStatus: LoginStatus;
  isLoginStatusInitialized = false;

  constructor(
    private readonly authService_: AuthService,
    private readonly cookieService_: CookieService,
    @Inject(CONFIG_DI_TOKEN) private readonly config_: IConfig
  ) {}

  get hasUsername(): boolean {
    return !!this.cookieService_.get(this.config_.usernameCookieName);
  }

  get username(): string {
    return this.cookieService_.get(this.config_.usernameCookieName);
  }

  ngOnInit(): void {
    this.authService_.getLoginStatus().subscribe(status => {
      this.loginStatus = status;
      this.isLoginStatusInitialized = true;
    });
  }

  isAuthSkipped(): boolean {
    return this.loginStatus && !this.authService_.isLoginPageEnabled() && !this.loginStatus.headerPresent;
  }

  isLoggedIn(): boolean {
    return this.loginStatus && !this.loginStatus.headerPresent && this.loginStatus.tokenPresent;
  }

  isAuthEnabled(): boolean {
    return this.loginStatus ? this.loginStatus.httpsMode : false;
  }

  logout(): void {
    this.authService_.logout();
  }

  close(): void {
    this.trigger_.closeMenu();
  }
}
