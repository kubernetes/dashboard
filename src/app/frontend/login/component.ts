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

import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {AuthenticationMode, EnabledAuthenticationModes, LoginSpec} from '@api/backendapi';
import {KdFile} from '@api/frontendapi';
import {StateService} from '@uirouter/core';

import {K8SError} from '../common/errors/errors';
import {NAMESPACE_STATE_PARAM} from '../common/params/params';
import {AuthService} from '../common/services/global/authentication';
import {CONFIG} from '../index.config';
import {overviewState} from '../overview/state';

enum LoginModes {
  Kubeconfig = 'kubeconfig',
  Basic = 'basic',
  Token = 'token',
}

@Component({selector: 'kd-login', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class LoginComponent implements OnInit {
  loginModes = LoginModes;
  selectedAuthenticationMode = LoginModes.Kubeconfig;
  // TODO handle errors
  errors: K8SError[];

  private enabledAuthenticationModes_: AuthenticationMode[] = [];
  private kubeconfig_: string;
  private token_: string;
  private username_: string;
  private password_: string;

  constructor(
      private readonly authService_: AuthService, private readonly state_: StateService,
      private readonly httpClient: HttpClient) {}

  ngOnInit(): void {
    this.httpClient.get<EnabledAuthenticationModes>('api/v1/login/modes')
        .subscribe((enabledModes: EnabledAuthenticationModes) => {
          this.enabledAuthenticationModes_ = enabledModes.modes;
        });
  }

  getEnabledAuthenticationModes(): AuthenticationMode[] {
    if (this.enabledAuthenticationModes_.length > 0 &&
        this.enabledAuthenticationModes_.indexOf(LoginModes.Kubeconfig) < 0) {
      // Push this option to the beginning of the list
      this.enabledAuthenticationModes_.splice(0, 0, LoginModes.Kubeconfig);
    }

    return this.enabledAuthenticationModes_;
  }

  login(): void {
    this.authService_.login(this.getLoginSpec_(), (errors: K8SError[]) => {
      if (errors.length > 0) {
        this.errors = errors;
        return;
      }

      this.state_.go(overviewState.name, {[NAMESPACE_STATE_PARAM]: CONFIG.defaultNamespace});
    });
  }

  skip(): void {
    this.authService_.skipLoginPage(true);
    this.state_.go(overviewState.name, {[NAMESPACE_STATE_PARAM]: CONFIG.defaultNamespace});
  }

  onChange(event: Event&KdFile): void {
    switch (this.selectedAuthenticationMode) {
      case (LoginModes.Kubeconfig):
        this.onFileLoad_(event as KdFile);
        break;
      case (LoginModes.Token):
        this.token_ = (event.target as HTMLInputElement).value;
        break;
      case (LoginModes.Basic):
        if ((event.target as HTMLInputElement).id === 'username') {
          this.username_ = (event.target as HTMLInputElement).value;
        } else {
          this.password_ = (event.target as HTMLInputElement).value;
        }
        break;
      default:
    }
  }

  private onFileLoad_(file: KdFile): void {
    this.kubeconfig_ = file.content;
  }

  private getLoginSpec_(): LoginSpec {
    switch (this.selectedAuthenticationMode) {
      case (LoginModes.Kubeconfig):
        return {kubeConfig: this.kubeconfig_} as LoginSpec;
      case (LoginModes.Token):
        return {token: this.token_} as LoginSpec;
      case (LoginModes.Basic):
        return {username: this.username_, password: this.password_} as LoginSpec;
      default:
        return {} as LoginSpec;
    }
  }
}
