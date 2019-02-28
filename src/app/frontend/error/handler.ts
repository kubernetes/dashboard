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
import {ErrorHandler, Injectable, Injector} from '@angular/core';
import {Router} from '@angular/router';
import {YAMLException} from 'js-yaml';

import {ApiErrors, KdError} from '../common/errors/errors';
import {ErrorStateParams} from '../common/params/params';
import {AuthService} from '../common/services/global/authentication';

import {errorState} from './state';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private authService_: AuthService;

  constructor(private readonly router_: Router, private readonly injector_: Injector) {
    this.authService_ = injector_.get(AuthService);
  }

  handleError(error: HttpErrorResponse|YAMLException): void {
    console.log('========= Error =========');
    console.log(error);
    console.log('========= Error  end =========');
    if (error instanceof HttpErrorResponse) {
      this.handleHTTPError_(error);
      return;
    }

    if (error instanceof YAMLException) {
      // TODO think what to do with this error. For now let's just silence it.
      return;
    }

    throw error;
  }

  private handleHTTPError_(error: HttpErrorResponse): void {
    if (KdError.isError(error, ApiErrors.tokenExpired, ApiErrors.encryptionKeyChanged)) {
      return;
    }

    this.router_.navigate([errorState.name], {
      queryParams: {
        resourceNamespace: null,
        error: this.toKdError(error),
      } as ErrorStateParams
    });
  }

  private toKdError(error: HttpErrorResponse): KdError {
    const result = {} as KdError;
    let status: string;

    result.code = error.status;
    result.message = error.error;

    // This should be localized eventually
    switch (error.status) {
      case 401:
        status = 'Unauthorized';
        break;
      case 403:
        status = 'Forbidden';
        break;
      case 500:
        status = 'Internal error';
        break;
      default:
        status = 'Unknown error';
    }

    result.status = status;
    return result;
  }
}
