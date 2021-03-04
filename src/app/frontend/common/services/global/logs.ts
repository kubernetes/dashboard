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

@Injectable()
export class LogService {
  previous_ = false;
  inverted_ = false;
  compact_ = false;
  showTimestamp_ = false;
  following_ = false;
  autoRefresh_ = false;

  constructor(private readonly http_: HttpClient) {}

  getResource<T>(uri: string, params?: HttpParams): Observable<T> {
    return this.http_.get<T>(`api/v1/log/${uri}`, {params});
  }

  setFollowing(status: boolean): void {
    this.following_ = status;
  }

  getFollowing(): boolean {
    return this.following_;
  }

  toggleAutoRefresh(): void {
    this.autoRefresh_ = !this.autoRefresh_;
  }

  getAutoRefresh(): boolean {
    return this.autoRefresh_;
  }

  togglePrevious(): void {
    this.previous_ = !this.previous_;
  }

  getPrevious(): boolean {
    return this.previous_;
  }

  toggleInverted(): void {
    this.inverted_ = !this.inverted_;
  }

  getInverted(): boolean {
    return this.inverted_;
  }

  toggleCompact(): void {
    this.compact_ = !this.compact_;
  }

  getCompact(): boolean {
    return this.compact_;
  }

  toggleShowTimestamp(): void {
    this.showTimestamp_ = !this.showTimestamp_;
  }

  getShowTimestamp(): boolean {
    return this.showTimestamp_;
  }

  getLogFileName(pod: string, container: string): string {
    return `logs-from-${container}-in-${pod}.log`;
  }
}
