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

import {Component, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {GlobalSettings, K8sError, LocalSettings} from '@api/backendapi';
import {KdError} from '@api/frontendapi';
import {StateService} from '@uirouter/core';

import {ErrorStateParams} from '../common/params/params';
import {SettingsService} from '../common/services/global/settings';
import {TitleService} from '../common/services/global/title';
import {errorState} from '../error/state';

import {SaveAnywayDialog} from './saveanywaysdialog/dialog';

@Component({selector: 'kd-settings', templateUrl: './template.html'})
export class SettingsComponent implements OnInit {
  // Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
  private readonly concurrentChangeErr_ = 'settings changed since last reload';
  global: GlobalSettings = {} as GlobalSettings;
  local: LocalSettings = {} as LocalSettings;

  constructor(
      private readonly settings_: SettingsService, private readonly dialog_: MatDialog,
      private readonly state_: StateService, private readonly title_: TitleService) {}

  ngOnInit(): void {
    this.loadGlobalSettings();
    this.loadLocalSettings();
  }

  isInitialized(): boolean {
    return this.settings_.isInitialized();
  }

  loadGlobalSettings(): void {
    // TODO Make form pristine.
    this.settings_.loadGlobalSettings(
        this.onSettingsLoad.bind(this), this.onSettingsLoadError.bind(this));
  }

  onSettingsLoad(): void {
    this.global.itemsPerPage = this.settings_.getItemsPerPage();
    this.global.clusterName = this.settings_.getClusterName();
    this.global.autoRefreshTimeInterval = this.settings_.getAutoRefreshTimeInterval();
  }

  onSettingsLoadError(err: KdError|K8sError): void {
    this.state_.go(errorState.name, new ErrorStateParams(err, ''));
  }

  saveGlobalSettings(form: NgForm): void {
    this.settings_.saveGlobalSettings(this.global)
        .subscribe(
            () => {
              this.loadGlobalSettings();
              this.title_.update();
            },
            (err) => {
              if (err && err.data.indexOf(this.concurrentChangeErr_) !== -1) {
                this.dialog_.open(SaveAnywayDialog, {width: '420px'})
                    .afterClosed()
                    .subscribe((result) => {
                      if (result === true) {
                        // Backend was refreshed with the PUT request, so the second try will be
                        // successful unless yet another concurrent change will happen. In that case
                        // "save anyways" dialog will be shown again.
                        this.saveGlobalSettings(form);
                      } else {
                        this.loadGlobalSettings();
                      }
                    });
              }
            });
  }

  loadLocalSettings(form?: NgForm): void {
    this.local = this.settings_.getLocalSettings();

    if (form) {
      form.resetForm(this.local);
    }
  }

  saveLocalSettings(form: NgForm): void {
    form.resetForm(this.settings_.saveLocalSettings(this.local));
  }
}
