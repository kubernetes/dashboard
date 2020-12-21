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

import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {GlobalSettings, NamespaceList} from '@api/root.api';
import {Observable, of, Subject} from 'rxjs';
import {catchError, map, take, takeUntil, tap} from 'rxjs/operators';
import {GlobalSettingsService} from '../../common/services/global/globalsettings';
import {TitleService} from '../../common/services/global/title';
import {EndpointManager, Resource} from '../../common/services/resource/endpoint';
import {ResourceService} from '../../common/services/resource/resource';

import {SaveAnywayDialog} from './saveanywaysdialog/dialog';

enum BreakpointElementCount {
  XLarge = 5,
  Large = 3,
  Medium = 2,
  Small = 2,
}

@Component({
  selector: 'kd-global-settings',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class GlobalSettingsComponent implements OnInit, OnDestroy {
  settings: GlobalSettings = {} as GlobalSettings;
  hasLoadError = false;
  namespaces$: Observable<string[]>;
  visibleNamespaces = 0;

  // Keep it in sync with ConcurrentSettingsChangeError constant from the backend.
  private readonly concurrentChangeErr_ = 'settings changed since last reload';
  private readonly unsubscribe_ = new Subject<void>();
  private readonly visibleNamespacesMap: [string, number][] = [
    [Breakpoints.XLarge, BreakpointElementCount.XLarge],
    [Breakpoints.Large, BreakpointElementCount.Large],
    [Breakpoints.Medium, BreakpointElementCount.Medium],
    [Breakpoints.Small, BreakpointElementCount.Small],
  ];

  constructor(
    private readonly settings_: GlobalSettingsService,
    private readonly namespaceService_: ResourceService<NamespaceList>,
    private readonly dialog_: MatDialog,
    private readonly title_: TitleService,
    private readonly breakpointObserver_: BreakpointObserver
  ) {}

  get invisibleCount(): number {
    return this.settings.namespaceFallbackList
      ? this.settings.namespaceFallbackList.length - this.visibleNamespaces
      : 0;
  }

  ngOnInit(): void {
    const endpoint = EndpointManager.resource(Resource.namespace).list();
    this.namespaces$ = this.namespaceService_
      .get(endpoint)
      .pipe(map(list => list.namespaces.map(ns => ns.objectMeta.name)));
    this.breakpointObserver_
      .observe([Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(result => {
        const breakpoint = this.visibleNamespacesMap.find(breakpoint => result.breakpoints[breakpoint[0]]);
        this.visibleNamespaces = breakpoint ? breakpoint[1] : BreakpointElementCount.Small;
      });

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
    this.settings.labelsLimit = this.settings_.getLabelsLimit();
    this.settings.clusterName = this.settings_.getClusterName();
    this.settings.logsAutoRefreshTimeInterval = this.settings_.getLogsAutoRefreshTimeInterval();
    this.settings.resourceAutoRefreshTimeInterval = this.settings_.getResourceAutoRefreshTimeInterval();
    this.settings.disableAccessDeniedNotifications = this.settings_.getDisableAccessDeniedNotifications();
    this.settings.defaultNamespace = this.settings_.getDefaultNamespace();
    this.settings.namespaceFallbackList = this.settings_.getNamespaceFallbackList();
  }

  onLoadError(): void {
    this.hasLoadError = true;
  }

  save(form: NgForm): void {
    this.settings_
      .save(this.settings)
      .pipe(
        tap(_ => {
          this.load(form);
          this.title_.update();
          this.settings_.onSettingsUpdate.next();
        })
      )
      .pipe(
        catchError(err => {
          if (err && err.data.indexOf(this.concurrentChangeErr_) !== -1) {
            return this.dialog_.open(SaveAnywayDialog, {width: '420px'}).afterClosed();
          }

          return of(false);
        })
      )
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
}
