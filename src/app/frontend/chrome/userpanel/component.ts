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
import {LoginStatus} from '@api/backendapi';
import {AuthService} from '../../common/services/global/authentication';
import {KubeconfigService} from '../../common/services/global/kubeconfig';

@Component({
  selector: 'kd-user-panel',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
  host: {
    '[class.kd-hidden]': 'this.isAuthEnabled() === false',
  },
})
export class UserPanelComponent implements OnInit {
  loginStatus: LoginStatus;
  isLoginStatusInitialized = false;
  currentContext: string;
  contexts: string[];

  constructor(private readonly authService_: AuthService, private readonly kubeconfigService_: KubeconfigService) {}

  ngOnInit(): void {
    this.authService_.getLoginStatus().subscribe(status => {
      this.loginStatus = status;
      this.isLoginStatusInitialized = true;
    });
    this.contexts = this.kubeconfigService_.getContexts();
    this.currentContext = this.kubeconfigService_.getCurrentContext();
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

  isCurrentContext(context: string): boolean {
    this.currentContext = this.kubeconfigService_.getCurrentContext();
    return context === this.currentContext;
  }

  switchContext(context: string): void {
    this.kubeconfigService_.switchContext(context);
  }

  logout(): void {
    this.authService_.logout();
  }
}
