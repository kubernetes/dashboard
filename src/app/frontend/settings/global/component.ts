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
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {GlobalSettings, NamespaceList} from '@api/root.api';
import {of, Subject} from 'rxjs';
import {Observable} from 'rxjs/Observable';
import {catchError, take, takeUntil, tap} from 'rxjs/operators';
import {GlobalSettingsService} from '../../common/services/global/globalsettings';
import {TitleService} from '../../common/services/global/title';
import {ResourceService} from '../../common/services/resource/resource';

import {SaveAnywayDialog} from './saveanywaysdialog/dialog';

enum Controls {
  ClusterName = 'clusterName',
  ItemsPerPage = 'itemsPerPage',
  LabelsLimit = 'labelsLimit',
  LogsAutorefreshInterval = 'logsAutorefreshInterval',
  ResourceAutorefreshInterval = 'resourceAutorefreshInterval',
  DisableAccessDeniedNotification = 'disableAccessDeniedNotification',
  NamespaceSettings = 'namespaceSettings',
}

@Component({
  selector: 'kd-global-settings',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class GlobalSettingsComponent implements OnInit, OnDestroy {
  readonly Controls = Controls;

  settings: GlobalSettings = {} as GlobalSettings;
  hasLoadError = false;
  form: FormGroup;

  // Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
  private readonly concurrentChangeErr_ = 'settings changed since last reload';
  private readonly unsubscribe_ = new Subject<void>();

  constructor(
    private readonly settings_: GlobalSettingsService,
    private readonly namespaceService_: ResourceService<NamespaceList>,
    private readonly dialog_: MatDialog,
    private readonly title_: TitleService,
    private readonly builder_: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.builder_.group({
      [Controls.ClusterName]: this.builder_.control(''),
      [Controls.ItemsPerPage]: this.builder_.control(''),
      [Controls.LabelsLimit]: this.builder_.control(''),
      [Controls.LogsAutorefreshInterval]: this.builder_.control(''),
      [Controls.ResourceAutorefreshInterval]: this.builder_.control(''),
      [Controls.DisableAccessDeniedNotification]: this.builder_.control(''),
      [Controls.NamespaceSettings]: this.builder_.control(''),
    });

    this.load_();
    this.form.valueChanges.pipe(takeUntil(this.unsubscribe_)).subscribe(this.onFormChange_.bind(this));
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  isInitialized(): boolean {
    return this.settings_.isInitialized();
  }

  reload(): void {
    this.form.reset();
    this.load_();
  }

  canSave(): boolean {}

  save(): void {
    this.settings_
      .save(this.settings)
      .pipe(
        tap(_ => {
          this.load_();
          this.title_.update();
          this.settings_.onSettingsUpdate.next();
        })
      )
      .pipe(catchError(this.onSaveError_.bind(this)))
      .pipe(take(1))
      .subscribe(this.onSave_.bind(this));
  }

  private onSave_(result: GlobalSettings | boolean): void {
    if (result === true) {
      this.save();
    }

    this.reload();
  }

  private onSaveError_(err: HttpErrorResponse): Observable<boolean> {
    if (err && err.error.indexOf(this.concurrentChangeErr_) !== -1) {
      return this.dialog_.open(SaveAnywayDialog, {width: '420px'}).afterClosed();
    }

    return of(false);
  }

  private load_(): void {
    this.settings_
      .canI()
      .pipe(take(1))
      .subscribe(canI => (this.hasLoadError = !canI));
    this.settings_.load(this.onLoad_.bind(this), this.onLoadError_.bind(this));
  }

  private onLoad_(): void {
    this.settings.itemsPerPage = this.settings_.getItemsPerPage();
    this.settings.labelsLimit = this.settings_.getLabelsLimit();
    this.settings.clusterName = this.settings_.getClusterName();
    this.settings.logsAutoRefreshTimeInterval = this.settings_.getLogsAutoRefreshTimeInterval();
    this.settings.resourceAutoRefreshTimeInterval = this.settings_.getResourceAutoRefreshTimeInterval();
    this.settings.disableAccessDeniedNotifications = this.settings_.getDisableAccessDeniedNotifications();
    this.settings.defaultNamespace = this.settings_.getDefaultNamespace();
    this.settings.namespaceFallbackList = this.settings_.getNamespaceFallbackList();

    this.form.get(Controls.ClusterName).setValue(this.settings.clusterName, {emitEvent: false});
    this.form.get(Controls.ItemsPerPage).setValue(this.settings.itemsPerPage, {emitEvent: false});
    this.form.get(Controls.LabelsLimit).setValue(this.settings.labelsLimit, {emitEvent: false});
    this.form
      .get(Controls.LogsAutorefreshInterval)
      .setValue(this.settings.logsAutoRefreshTimeInterval, {emitEvent: false});
    this.form
      .get(Controls.ResourceAutorefreshInterval)
      .setValue(this.settings.resourceAutoRefreshTimeInterval, {emitEvent: false});
    this.form
      .get(Controls.DisableAccessDeniedNotification)
      .setValue(this.settings.disableAccessDeniedNotifications, {emitEvent: false});
    this.form
      .get(Controls.NamespaceSettings)
      .setValue(
        {defaultNamespace: this.settings.defaultNamespace, fallbackList: this.settings.namespaceFallbackList},
        {emitEvent: false}
      );
  }

  private onLoadError_(): void {
    this.hasLoadError = true;
  }

  private onFormChange_(): void {
    this.settings.itemsPerPage = this.form.get(Controls.ItemsPerPage).value;
    this.settings.labelsLimit = this.form.get(Controls.LabelsLimit).value;
    this.settings.clusterName = this.form.get(Controls.ClusterName).value;
    this.settings.logsAutoRefreshTimeInterval = this.form.get(Controls.LogsAutorefreshInterval).value;
    this.settings.resourceAutoRefreshTimeInterval = this.form.get(Controls.ResourceAutorefreshInterval).value;
    this.settings.disableAccessDeniedNotifications = this.form.get(Controls.DisableAccessDeniedNotification).value;

    const namespaceSettings = this.form.get(Controls.NamespaceSettings).value as {
      defaultNamespace: string;
      fallbackList: [];
    };

    if (namespaceSettings) {
      console.log(namespaceSettings);
      this.settings.defaultNamespace = namespaceSettings.defaultNamespace;
      this.settings.namespaceFallbackList = namespaceSettings.fallbackList;
    }
  }
}
