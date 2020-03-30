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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {GlobalSettings} from '@api/backendapi';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {GlobalSettingsService} from '../../common/services/global/globalsettings';
import {TitleService} from '../../common/services/global/title';

import {SaveAnywayDialog} from './saveanywaysdialog/dialog';

@Component({
  selector: 'kd-global-settings',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class GlobalSettingsComponent implements OnInit, OnDestroy {
  // Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
  private readonly concurrentChangeErr_ = 'settings changed since last reload';
  settings: GlobalSettings = {} as GlobalSettings;
  hasLoadError = false;

  private readonly unsubscribe_ = new Subject<void>();

  constructor(
    private readonly settings_: GlobalSettingsService,
    private readonly dialog_: MatDialog,
    private readonly title_: TitleService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }

  isInitialized(): boolean {
    return this.settings_.isInitialized();
  }

  load(form?: NgForm): void {
    if (form) {
      form.resetForm();
    }

    this.settings_
      .canI()
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(canI => (this.hasLoadError = !canI));
    this.settings_.load(this.onLoad.bind(this), this.onLoadError.bind(this));
  }

  onLoad(): void {
    this.settings.itemsPerPage = this.settings_.getItemsPerPage();
    this.settings.clusterName = this.settings_.getClusterName();
    this.settings.logsAutoRefreshTimeInterval = this.settings_.getLogsAutoRefreshTimeInterval();
    this.settings.resourceAutoRefreshTimeInterval = this.settings_.getResourceAutoRefreshTimeInterval();
    this.settings.disableAccessDeniedNotifications = this.settings_.getDisableAccessDeniedNotifications();
  }

  onLoadError(): void {
    this.hasLoadError = true;
  }

  save(form: NgForm): void {
    this.settings_.save(this.settings).subscribe(
      () => {
        this.load(form);
        this.title_.update();
        this.settings_.onSettingsUpdate.next();
      },
      err => {
        if (err && err.data.indexOf(this.concurrentChangeErr_) !== -1) {
          this.dialog_
            .open(SaveAnywayDialog, {width: '420px'})
            .afterClosed()
            .subscribe(result => {
              if (result === true) {
                // Backend was refreshed with the PUT request, so the second try will be
                // successful unless yet another concurrent change will happen. In that case
                // "save anyways" dialog will be shown again.
                this.save(form);
              } else {
                this.load(form);
              }
            });
        }
      },
    );
  }
}
