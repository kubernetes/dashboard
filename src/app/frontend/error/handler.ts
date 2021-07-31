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

import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHandler, Injectable, Injector, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {StateError} from '@api/root.ui';

import {ApiError, AsKdError, KdError} from '@common/errors/errors';
import {AuthService} from '@common/services/global/authentication';
import {YAMLException} from 'js-yaml';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly injector_: Injector, private readonly ngZone_: NgZone) {}

  private get router_(): Router {
    return this.injector_.get(Router);
  }

  private get auth_(): AuthService {
    return this.injector_.get(AuthService);
  }

  handleError(error: HttpErrorResponse | YAMLException): void {
    if (error instanceof HttpErrorResponse) {
      this.handleHTTPError_(error);
      return;
    }

    if (error instanceof YAMLException) {
      console.error(error);
      return;
    }

    throw error;
  }

  private handleHTTPError_(error: HttpErrorResponse): void {
    this.ngZone_.run(() => {
      if (KdError.isError(error, ApiError.tokenExpired, ApiError.encryptionKeyChanged)) {
        this.auth_.removeAuthCookies();
        this.router_.navigate(['login'], {
          state: {error: AsKdError(error)} as StateError,
        });
        return;
      }

      if (!this.router_.routerState.snapshot.url.includes('error')) {
        this.router_.navigate(['error'], {
          queryParamsHandling: 'preserve',
          state: {error: AsKdError(error)} as StateError,
        });
      }
    });
  }
}
