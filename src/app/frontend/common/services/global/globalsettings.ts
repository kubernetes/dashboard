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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {GlobalSettings} from '@api/root.api';
import {onSettingsFailCallback, onSettingsLoadCallback} from '@api/root.ui';
import _ from 'lodash';
import {Observable, of, ReplaySubject, Subject} from 'rxjs';
import {catchError, switchMap, takeUntil, tap} from 'rxjs/operators';

import {AuthorizerService} from './authorizer';

export const DEFAULT_SETTINGS: GlobalSettings = {
  itemsPerPage: 10,
  clusterName: '',
  labelsLimit: 3,
  logsAutoRefreshTimeInterval: 5,
  resourceAutoRefreshTimeInterval: 5,
  disableAccessDeniedNotifications: false,
  defaultNamespace: 'default',
  namespaceFallbackList: ['default'],
};

@Injectable({providedIn: 'root'})
export class GlobalSettingsService {
  onSettingsUpdate = new ReplaySubject<void>();
  onPageVisibilityChange = new EventEmitter<boolean>();

  private readonly endpoint_ = 'api/v1/settings/global';
  private settings_: GlobalSettings = DEFAULT_SETTINGS;
  private unsubscribe_ = new Subject<void>();
  private isInitialized_ = false;
  private isPageVisible_ = true;

  constructor(private readonly http_: HttpClient, private readonly authorizer_: AuthorizerService) {}

  init(): Promise<GlobalSettings> {
    this.onPageVisibilityChange.pipe(takeUntil(this.unsubscribe_)).subscribe(visible => {
      this.isPageVisible_ = visible;
      this.onSettingsUpdate.next();
    });

    return this.load();
  }

  isInitialized(): boolean {
    return this.isInitialized_;
  }

  load(onLoad?: onSettingsLoadCallback, onFail?: onSettingsFailCallback): Promise<GlobalSettings> {
    return this.http_
      .get<GlobalSettings>(this.endpoint_)
      .pipe(
        tap(settings => {
          this.settings_ = this._defaultSettings(settings);
          this.isInitialized_ = true;
          this.onSettingsUpdate.next();
          if (onLoad) onLoad(this.settings_);
        }),
        catchError(err => {
          this.isInitialized_ = false;
          this.onSettingsUpdate.next();
          if (onFail) onFail(err);
          return of(DEFAULT_SETTINGS);
        })
      )
      .toPromise();
  }

  private _defaultSettings(settings: GlobalSettings): GlobalSettings {
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  }

  canI(): Observable<boolean> {
    return this.authorizer_
      .proxyGET<GlobalSettings>(this.endpoint_)
      .pipe(switchMap(_ => of(true)))
      .pipe(catchError(_ => of(false)));
  }

  save(settings: GlobalSettings): Observable<GlobalSettings> {
    const httpOptions = {
      method: 'PUT',
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http_.put<GlobalSettings>(this.endpoint_, settings, httpOptions);
  }

  getClusterName(): string {
    return this.settings_.clusterName;
  }

  getItemsPerPage(): number {
    return this.settings_.itemsPerPage;
  }

  getLabelsLimit(): number {
    return this.settings_.labelsLimit;
  }

  getLogsAutoRefreshTimeInterval(): number {
    return this.isPageVisible_ ? this.settings_.logsAutoRefreshTimeInterval : 0;
  }

  getResourceAutoRefreshTimeInterval(): number {
    return this.isPageVisible_ ? this.settings_.resourceAutoRefreshTimeInterval : 0;
  }

  getDisableAccessDeniedNotifications(): boolean {
    return this.settings_.disableAccessDeniedNotifications;
  }

  getDefaultNamespace(): string {
    return this.settings_.defaultNamespace;
  }

  getNamespaceFallbackList(): string[] {
    return _.isArray(this.settings_.namespaceFallbackList)
      ? this.settings_.namespaceFallbackList
      : [this.settings_.defaultNamespace];
  }
}
