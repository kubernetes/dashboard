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

import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {ResourceBase} from '../../resources/resource';
import {NamespaceService} from '../global/namespace';

@Injectable()
export class UtilityService<T> extends ResourceBase {
  constructor(readonly http: HttpClient, private readonly namespace_: NamespaceService) {
    super(http);
  }

  shell(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(endpoint, {params});
  }
}
