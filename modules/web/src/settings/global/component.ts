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
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {GlobalSettings, NamespaceList} from '@api/root.api';
import isEqual from 'lodash-es/isEqual';
import {Observable, of} from 'rxjs';
import {catchError, switchMap, take, tap} from 'rxjs/operators';

import {GlobalSettingsService} from '@common/services/global/globalsettings';
import {TitleService} from '@common/services/global/title';
import {ResourceService} from '@common/services/resource/resource';

import {SaveAnywayDialogComponent} from './saveanywaysdialog/dialog';
import {SettingsHelperService} from './service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AlertDialogComponent} from '@common/dialogs/alert/dialog';
import {AsKdError} from '@common/errors/errors';

enum Controls {
  ClusterName = 'clusterName',
  ItemsPerPage = 'itemsPerPage',
  LabelsLimit = 'labelsLimit',
  LogsAutorefreshInterval = 'logsAutorefreshInterval',
  ResourceAutorefreshInterval = 'resourceAutorefreshInterval',
  DisableAccessDeniedNotification = 'disableAccessDeniedNotification',
  NamespaceSettings = 'namespaceSettings',
  HideAllNamespaces = 'hideAllNamespaces',
}

@Component({
  selector: 'kd-global-settings',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class GlobalSettingsComponent implements OnInit {
  readonly Controls = Controls;

  settings: GlobalSettings = {} as GlobalSettings;
  hasLoadError = false;
  form: UntypedFormGroup;

  // Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
  private readonly concurrentChangeErr_ = 'settings changed since last reload';

  private destroyRef = inject(DestroyRef);

  constructor(
    private readonly settingsService_: GlobalSettingsService,
    private readonly settingsHelperService_: SettingsHelperService,
    private readonly namespaceService_: ResourceService<NamespaceList>,
    private readonly dialog_: MatDialog,
    private readonly title_: TitleService,
    private readonly builder_: UntypedFormBuilder
  ) {}

  private get externalSettings_(): GlobalSettings {
    const settings = {} as GlobalSettings;

    settings.itemsPerPage = this.settingsService_.getItemsPerPage();
    settings.labelsLimit = this.settingsService_.getLabelsLimit();
    settings.clusterName = this.settingsService_.getClusterName();
    settings.logsAutoRefreshTimeInterval = this.settingsService_.getLogsAutoRefreshTimeInterval();
    settings.resourceAutoRefreshTimeInterval = this.settingsService_.getResourceAutoRefreshTimeInterval();
    settings.disableAccessDeniedNotifications = this.settingsService_.getDisableAccessDeniedNotifications();
    settings.hideAllNamespaces = this.settingsService_.getHideAllNamespaces();
    settings.defaultNamespace = this.settingsService_.getDefaultNamespace();
    settings.namespaceFallbackList = this.settingsService_.getNamespaceFallbackList();

    return settings;
  }

  ngOnInit(): void {
    this.form = this.builder_.group({
      [Controls.ClusterName]: this.builder_.control(''),
      [Controls.ItemsPerPage]: this.builder_.control(0),
      [Controls.LabelsLimit]: this.builder_.control(0),
      [Controls.LogsAutorefreshInterval]: this.builder_.control(0),
      [Controls.ResourceAutorefreshInterval]: this.builder_.control(0),
      [Controls.DisableAccessDeniedNotification]: this.builder_.control(false),
      [Controls.HideAllNamespaces]: this.builder_.control(false),
      [Controls.NamespaceSettings]: this.builder_.control(''),
    });

    this.load_();
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.onFormChange_.bind(this));
    this.settingsHelperService_.onSettingsChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(s => (this.settings = s));
  }

  isInitialized(): boolean {
    return this.settingsService_.isInitialized();
  }

  reload(): void {
    this.form.reset();
    this.settingsHelperService_.reset();
    this.load_();
  }

  canSave(): boolean {
    return !isEqual(this.settings, this.externalSettings_) && !this.hasLoadError;
  }

  save(): void {
    this.settingsService_
      .save(this.settings)
      .pipe(
        tap(_ => {
          this.load_();
          this.title_.update();
          this.settingsService_.onSettingsUpdate.next();
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
    const kdError = AsKdError(err);
    if (kdError.message.indexOf(this.concurrentChangeErr_) !== -1) {
      return this.dialog_.open(SaveAnywayDialogComponent, {width: '420px'}).afterClosed();
    }

    this.reload();
    return this.dialog_
      .open(AlertDialogComponent, {
        data: {
          title: 'Could not save settings',
          message: `${kdError.message}`,
          confirmLabel: 'Close',
        },
      })
      .afterClosed()
      .pipe(switchMap(_ => of(false)));
  }

  private load_(): void {
    this.settingsService_
      .canI()
      .pipe(take(1))
      .subscribe(canI => (this.hasLoadError = !canI));
    this.settingsService_.load(this.onLoad_.bind(this), this.onLoadError_.bind(this));
  }

  private onLoad_(): void {
    this.settings = this.externalSettings_;
    this.settingsHelperService_.settings = this.settings;

    this.form.get(Controls.ItemsPerPage).setValue(this.settings.itemsPerPage, {emitEvent: false});
    this.form.get(Controls.LabelsLimit).setValue(this.settings.labelsLimit, {emitEvent: false});
    this.form.get(Controls.ClusterName).setValue(this.settings.clusterName, {emitEvent: false});
    this.form
      .get(Controls.LogsAutorefreshInterval)
      .setValue(this.settings.logsAutoRefreshTimeInterval, {emitEvent: false});
    this.form
      .get(Controls.ResourceAutorefreshInterval)
      .setValue(this.settings.resourceAutoRefreshTimeInterval, {emitEvent: false});
    this.form
      .get(Controls.DisableAccessDeniedNotification)
      .setValue(this.settings.disableAccessDeniedNotifications, {emitEvent: false});
    this.form.get(Controls.HideAllNamespaces).setValue(this.settings.hideAllNamespaces, {emitEvent: false});
  }

  private onLoadError_(): void {
    this.hasLoadError = true;
  }

  private onFormChange_(): void {
    this.settingsHelperService_.settings = {
      itemsPerPage: this.form.get(Controls.ItemsPerPage).value,
      clusterName: this.form.get(Controls.ClusterName).value,
      disableAccessDeniedNotifications: this.form.get(Controls.DisableAccessDeniedNotification).value,
      hideAllNamespaces: this.form.get(Controls.HideAllNamespaces).value,
      labelsLimit: this.form.get(Controls.LabelsLimit).value,
      logsAutoRefreshTimeInterval: this.form.get(Controls.LogsAutorefreshInterval).value,
      resourceAutoRefreshTimeInterval: this.form.get(Controls.ResourceAutorefreshInterval).value,
    } as GlobalSettings;
  }
}
