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
import {ActivatedRoute} from '@angular/router';
import {StateError} from '@api/root.ui';
import {map} from 'rxjs/operators';

import {ErrorCode, KdError} from '../common/errors/errors';
import {AuthService} from '@common/services/global/authentication';
import {LoginStatus} from '@api/root.api';

@Component({
  selector: 'kd-error',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class ErrorComponent implements OnInit {
  private _error: KdError;
  private _loginStatus: LoginStatus;
  isLoginStatusInitialized = false;

  constructor(private readonly _activatedRoute: ActivatedRoute, private readonly _authService: AuthService) {}

  ngOnInit(): void {
    this._activatedRoute.paramMap.pipe(map(() => window.history.state)).subscribe((state: StateError) => {
      if (state.error) {
        this._error = state.error;
      }
    });

    this._authService.getLoginStatus().subscribe(status => {
      this._loginStatus = status;
      this.isLoginStatusInitialized = true;
    });
  }

  getErrorStatus(): string {
    if (this._error) {
      return `${this._error.status} (${this._error.code})`;
    }

    return 'Unknown Error';
  }

  getErrorData(): string {
    if (this._error) {
      return this._error.message;
    }

    return 'No error data available.';
  }

  isAuthSkipped(): boolean {
    return this._loginStatus && !this._authService.isLoginPageEnabled() && !this._loginStatus.headerPresent;
  }

  isAuthError(): boolean {
    return this._error.code === ErrorCode.unauthorized;
  }

  goToSignIn(): void {
    this._authService.logout();
  }
}
