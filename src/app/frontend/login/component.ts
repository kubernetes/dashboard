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

import {Component} from '@angular/core';
import {StateService} from '@uirouter/core';
import {AuthService} from '../common/services/global/authentication';
import {overviewState} from '../overview/state';

enum LoginModes {
  Kubeconfig = 'Kubeconfig',
  Basic = 'Basic',
  Token = 'Token',
}

@Component({selector: 'kd-login', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class LoginComponent {
  loginModes = LoginModes;
  selectedAuthenticationMode = LoginModes.Token;

  constructor(private readonly authService_: AuthService, private readonly state_: StateService) {}

  getSupportedAuthenticationModes(): string[] {
    return Object.keys(LoginModes);
  }

  login(): void {}

  skip(): void {
    this.authService_.skipLoginPage(true);
    this.state_.go(overviewState.name);
  }
}
