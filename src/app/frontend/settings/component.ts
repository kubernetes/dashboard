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
import {MatDialog} from '@angular/material';
import {GlobalSettings, LocalSettings} from '@api/backendapi';
import {Subscription} from 'rxjs/Subscription';

import {SettingsService} from '../common/services/global/settings';
import {ThemeService} from '../common/services/global/theme';

import {SaveAnywayDialog} from './saveanywaysdialog/dialog';

@Component({selector: 'kd-settings', templateUrl: './template.html'})
export class SettingsComponent implements OnInit, OnDestroy {
  // Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
  private readonly concurrentChangeErr_ = 'settings changed since last reload';
  global: GlobalSettings = {
    clusterName: '',
    itemsPerPage: 10,
    autoRefreshTimeInterval: 5,
  };
  settingsSubscription: Subscription;
  isInitialized = false;
  local: LocalSettings = {
    isThemeDark: false,
  };

  constructor(
      private settings_: SettingsService, private theme_: ThemeService,
      private dialog_: MatDialog) {}

  ngOnInit() {
    this.reloadGlobal();
    this.loadLocal();
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

  // TODO should not subscribe more than once
  reloadGlobal() {
    this.settingsSubscription = this.settings_.getGlobalSettings().subscribe(
        (g) => {
          this.global = g;
          this.isInitialized = true;
        },
        err => {
          // TODO Go to error state
          console.log(err);
        });
  }

  saveGlobal() {
    // TODO save button and reload button + padding
    // TODO ng-disabled="$ctrl.globalForm.$pristine"
    // TODO kdAuthorizerService
    // let resource = this.resource_(
    //   'api/v1/settings/global', {},
    //   {save: {method: 'PUT', headers: {'Content-Type': 'application/json'}}});
    //
    // resource.save(
    //   settings,
    //   (savedSettings) => {
    //     // It will disable "save" button until user will modify at least one setting.
    //     this.globalForm.$setPristine();
    //     // Reload settings service to apply changes in the whole app without need to refresh.
    //     this.settingsService_.load();
    //   },
    //   (err) => {
    //
    //     if (err && err.data.indexOf(this.concurrentChangeErr_) !== -1) {

    this.dialog_.open(SaveAnywayDialog, {width: '420px'}).afterClosed().subscribe((result) => {
      if (result === true) {
        // Backend was refreshed with the PUT request, so the second try will be successful unless
        // yet another concurrent change will happen. In that case "save anyways" dialog will be
        // shown again.
        this.saveGlobal();
      } else {
        this.reloadGlobal();
      }
    });
  }

  loadLocal() {
    this.local = this.settings_.getLocalSettings();
  }

  saveLocal(form: LocalSettings) {
    this.local = {isThemeDark: form.isThemeDark};

    this.settings_.saveLocalSettings(this.local);
  }
}
