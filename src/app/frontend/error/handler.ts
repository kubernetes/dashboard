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
import {ErrorHandler, Injectable} from '@angular/core';
import {StateService} from '@uirouter/core';
import {KdError} from '../common/errors/errors';
import {ErrorStateParams} from '../common/params/params';
import {errorState} from './state';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly state_: StateService) {}

  handleError(error: HttpErrorResponse): void {
    if (error.status === 403) {
      this.state_.go(errorState.name, {
        resourceNamespace: null,
        error: {
          code: error.status,
          status: 'Unauthorized',
          message: error.error,
        } as KdError,
      } as ErrorStateParams);
      return;
    }

    throw error;
  }
}
