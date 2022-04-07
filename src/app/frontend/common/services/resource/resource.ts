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
import {timer} from 'rxjs';
import {Observable} from 'rxjs';
import {publishReplay, refCount, switchMap, switchMapTo} from 'rxjs/operators';

import {ResourceBase} from '../../resources/resource';
import {GlobalSettingsService} from '../global/globalsettings';
import {NamespaceService} from '../global/namespace';

@Injectable()
export class ResourceService<T> extends ResourceBase {
  /**
   * We need to provide HttpClient here since the base is not annotated with
   * @Injectable
   */
  constructor(readonly http: HttpClient, private readonly settings_: GlobalSettingsService) {
    super(http);
  }

  get(endpoint: string, name?: string, params?: HttpParams): Observable<T> {
    if (name) {
      endpoint = endpoint.replace(':name', name);
    }

    return this.settings_.onSettingsUpdate
      .pipe(
        switchMap(() => {
          let interval = this.settings_.getResourceAutoRefreshTimeInterval();
          interval = interval === 0 ? undefined : interval * 1000;
          return timer(0, interval);
        })
      )
      .pipe(switchMapTo(this.http_.get<T>(endpoint, {params})))
      .pipe(publishReplay(1))
      .pipe(refCount());
  }
}

@Injectable()
export class NamespacedResourceService<T> extends ResourceBase {
  constructor(
    readonly http: HttpClient,
    private readonly namespace_: NamespaceService,
    private readonly settings_: GlobalSettingsService
  ) {
    super(http);
  }

  private getNamespace_(): string {
    const currentNamespace = this.namespace_.current();
    return this.namespace_.isMultiNamespace(currentNamespace) ? ' ' : currentNamespace;
  }

  get(endpoint: string, name?: string, namespace?: string, params?: HttpParams): Observable<T> {
    if (namespace) {
      endpoint = endpoint.replace(':namespace', namespace);
    } else {
      endpoint = endpoint.replace(':namespace', this.getNamespace_());
    }

    if (name) {
      endpoint = endpoint.replace(':name', name);
    }

    return this.settings_.onSettingsUpdate
      .pipe(
        switchMap(() => {
          let interval = this.settings_.getResourceAutoRefreshTimeInterval();
          interval = interval === 0 ? undefined : interval * 1000;
          return timer(0, interval);
        })
      )
      .pipe(switchMapTo(this.http_.get<T>(endpoint, {params})))
      .pipe(publishReplay(1))
      .pipe(refCount());
  }
}
