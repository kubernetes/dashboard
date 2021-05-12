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
import {CanIResponse} from '@api/root.api';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';

import {ERRORS} from '../../errors/errors';

@Injectable()
export class AuthorizerService {
  authorizationSubUrl_ = '/cani';

  constructor(private readonly http_: HttpClient) {}

  proxyGET<T>(url: string): Observable<T> {
    return this.http_
      .get<CanIResponse>(`${url}${this.authorizationSubUrl_}`)
      .pipe(
        switchMap(response => {
          if (!response.allowed) {
            return throwError(ERRORS.forbidden);
          }

          return this.http_.get<T>(url);
        })
      )
      .pipe(catchError(e => throwError(e)));
  }
}
