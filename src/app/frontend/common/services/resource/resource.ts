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

import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {ResourceBase} from '../../resources/resource';

@Injectable()
export class NamespacedResourceService<T> extends ResourceBase<T> {
  get(name: string, namespace?: string, params?: HttpParams): Observable<T> {
    if (!name) {
      throw Error('Name can not be empty.');
    }

    namespace = namespace ? namespace : this.namespace_;
    const endpoint =
        this.baseEndpoint_.concat(this.baseEndpoint_.endsWith('/') ? namespace : `/${namespace}`);
    return this.http_.get<T>(endpoint.concat(`/${name}`), {params});
  }
}

@Injectable()
export class ResourceService<T> extends ResourceBase<T> {
  get(name: string, params?: HttpParams): Observable<T> {
    if (!name) {
      throw Error('Name can not be empty.');
    }

    return this.http_.get<T>(this.baseEndpoint_.concat(`/${name}`), {params});
  }
}
