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

import {Component, ViewChild} from '@angular/core';
import {MatMenuTrigger} from '@angular/material/menu';
import {AuthService} from '@common/services/global/authentication';
import {MeService} from '@common/services/global/me';

@Component({
  selector: 'kd-user-panel',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class UserPanelComponent /* implements OnInit */ {
  @ViewChild(MatMenuTrigger)
  private readonly trigger_: MatMenuTrigger;

  constructor(
    private readonly authService_: AuthService,
    private readonly _meService: MeService
  ) {}

  get username(): string {
    return this._meService.getUserName();
  }

  hasAuthHeader(): boolean {
    return this.authService_.hasAuthHeader();
  }

  hasTokenCookie(): boolean {
    return this.authService_.hasTokenCookie();
  }

  isAuthenticated(): boolean {
    return this.authService_.isAuthenticated();
  }

  logout(): void {
    this.authService_.logout();
  }

  close(): void {
    this.trigger_.closeMenu();
  }
}
