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
import {Injectable} from '@angular/core';
import {CanIResponse, Error} from '@api/backendapi';
import {StateService} from '@uirouter/angular';
import {StateParams} from '@uirouter/core';
import {Observable} from 'rxjs/Observable';

import {overviewState} from '../../../overview/state';

@Injectable()
export class AuthorizerService {
  authorizationSubUrl_ = '/cani';

  constructor(private http_: HttpClient, private state_: StateService) {}

  proxyGET<T>(url: string): Observable<T> {
    return this.http_.get<CanIResponse>(`${url}${this.authorizationSubUrl_}`)
        .switchMap<CanIResponse, T>(response => {
          if (!response.allowed) {
            return Observable.throw('not allowed');
          }

          return this.http_.get<T>(url);
        })
        .catch(e => {
          return Observable.throw(e);
        });
  }

  // getAccessForbiddenError() {
  //   return {
  //     error: {
  //       statusText: kdLocalizedErrors.MSG_FORBIDDEN_TITLE_ERROR,
  //       status: 403,
  //       data: kdLocalizedErrors.MSG_FORBIDDEN_ERROR,
  //     },
  //   };
  // }
}
