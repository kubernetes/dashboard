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
import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {LogControl, LogDetails, LogLine, LogSelection, LogSources} from '@api/root.api';

import {LogsDownloadDialog} from '@common/dialogs/download/dialog';
import {GlobalSettingsService} from 'common/services/global/globalsettings';
import {LogService} from 'common/services/global/logs';
import {NotificationSeverity, NotificationsService} from 'common/services/global/notifications';
import {merge, Observable, of, Subject, timer} from 'rxjs';
import {switchMap, take, takeUntil, tap} from 'rxjs/operators';

const i18n = {
  MSG_LOGS_ZEROSTATE_TEXT: 'The selected container has not logged any messages yet.',
  MSG_LOGS_TRUNCATED_WARNING: 'The middle part of the log file cannot be loaded, because it is too big.',
};

@Component({
  selector: 'kd-logs',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class LogsComponent implements OnDestroy {
  @ViewChild('logViewContainer', {static: true}) logViewContainer_: ElementRef;
  refreshInterval: number;
  podLogs: LogDetails;
  logsSet: string[];
  logSources: LogSources;
  pod: string;
  container: string;
  totalItems = 0;
  itemsPerPage = 10;
  currentSelection: LogSelection;
  isLoading: boolean;

  private readonly refreshUnsubscribe_ = new Subject<void>();
  private readonly logsPerView = 100;
  private readonly maxLogSize = 2e9;

  constructor(
    readonly logService: LogService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly settingsService_: GlobalSettingsService,
    private readonly dialog_: MatDialog,
    private readonly notifications_: NotificationsService,
    private readonly _router: Router
  ) {
    this.isLoading = true;
    this.refreshInterval = this.settingsService_.getLogsAutoRefreshTimeInterval();

    const namespace = this.activatedRoute_.snapshot.params.resourceNamespace;
    const resourceType = this.activatedRoute_.snapshot.params.resourceType;
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;
    const containerName = this.activatedRoute_.snapshot.queryParams.container;

    logService
      .getResource<LogSources>(`source/${namespace}/${resourceName}/${resourceType}`)
      .pipe(
        switchMap<LogSources, Observable<LogDetails>>(data => {
          this.logSources = data;
          this.pod = data.podNames[0]; // Pick first pod (cannot use resource name as it may
          // not be a pod).
          this.container = containerName ? containerName : data.containerNames[0]; // Pick from URL or first.
          this.appendContainerParam_();

          return this.logService.getResource(`${namespace}/${this.pod}/${this.container}`);
        })
      )
      .pipe(tap(_ => (this.logService.getAutoRefresh() ? this.toggleIntervalFunction_() : undefined)))
      .pipe(take(1))
      .subscribe(data => {
        this.updateUiModel_(data);
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this._router.navigate([], {
      queryParams: {['container']: null},
      queryParamsHandling: 'merge',
    });

    this.refreshUnsubscribe_.next();
    this.refreshUnsubscribe_.complete();
  }

  onContainerChange() {
    this.appendContainerParam_();
    this.loadNewest();
  }

  /**
   * Loads maxLogSize oldest lines of logs.
   */
  loadOldest(): void {
    this.loadView_(
      LogControl.LoadStart,
      LogControl.TimestampOldest,
      0,
      -this.maxLogSize - this.logsPerView,
      -this.maxLogSize,
      this.scrollToTop_.bind(this)
    );
  }

  /**
   * Loads maxLogSize newest lines of logs.
   */
  loadNewest(): void {
    this.loadView_(
      LogControl.LoadEnd,
      LogControl.TimestampNewest,
      0,
      this.maxLogSize,
      this.maxLogSize + this.logsPerView,
      this.scrollToBottom_.bind(this)
    );
  }

  /**
   * Shifts view by maxLogSize lines to the past.
   */
  loadOlder(): void {
    this.loadView_(
      this.currentSelection.logFilePosition,
      this.currentSelection.referencePoint.timestamp,
      this.currentSelection.referencePoint.lineNum,
      this.currentSelection.offsetFrom - this.logsPerView,
      this.currentSelection.offsetFrom,
      this.scrollToBottom_.bind(this)
    );
  }

  /**
   * Shifts view by maxLogSize lines to the future.
   */
  loadNewer(): void {
    this.loadView_(
      this.currentSelection.logFilePosition,
      this.currentSelection.referencePoint.timestamp,
      this.currentSelection.referencePoint.lineNum,
      this.currentSelection.offsetTo,
      this.currentSelection.offsetTo + this.logsPerView,
      this.scrollToTop_.bind(this)
    );
  }

  onTextColorChange(): void {
    this.logService.toggleInverted();
  }

  onFontSizeChange(): void {
    this.logService.toggleCompact();
  }

  onShowTimestamp(): void {
    this.logService.toggleShowTimestamp();
    this.logsSet = this.formatAllLogs_(this.podLogs.logs);
  }

  /**
   * Execute when a user changes the selected option for show previous container logs.
   * @export
   */
  onPreviousChange(): void {
    this.logService.togglePrevious();
    this.loadNewest();
  }

  /**
   * Toggles log auto-refresh mechanism.
   */
  toggleLogAutoRefresh(): void {
    this.logService.toggleAutoRefresh();
    this.toggleIntervalFunction_();
  }

  downloadLog(): void {
    const dialogData = {
      data: {
        pod: this.pod,
        container: this.container,
        namespace: this.activatedRoute_.snapshot.paramMap.get('resourceNamespace'),
      },
    };
    this.dialog_.open(LogsDownloadDialog, dialogData);
  }

  /**
   * Listens for scroll events to set log following state.
   */
  onLogsScroll(): void {
    this.logService.setFollowing(this.isScrolledBottom_());
  }

  /**
   * Updates all state parameters and sets the current log view with the data returned from the
   * backend If logs are not available sets logs to no logs available message.
   */
  private updateUiModel_(podLogs: LogDetails): void {
    this.podLogs = podLogs;
    this.currentSelection = podLogs.selection;
    this.logsSet = this.formatAllLogs_(podLogs.logs);
    if (podLogs.info.truncated) {
      this.notifications_.push(i18n.MSG_LOGS_TRUNCATED_WARNING, NotificationSeverity.error);
    }

    if (this.logService.getFollowing()) {
      // Pauses very slightly for the view to refresh.
      setTimeout(() => {
        this.scrollToBottom_();
      });
    }
  }

  private formatAllLogs_(logs: LogLine[]): string[] {
    if (logs.length === 0) {
      logs = [{timestamp: '0', content: i18n.MSG_LOGS_ZEROSTATE_TEXT}];
    }
    return logs.map(line => this.formatLine_(line));
  }

  private formatLine_(line: LogLine): string {
    // add timestamp if needed
    const showTimestamp = this.logService.getShowTimestamp();
    return showTimestamp ? `${new Date(line.timestamp).toISOString()} | ${line.content}` : line.content;
  }

  private appendContainerParam_() {
    this._router.navigate([], {
      queryParams: {['container']: this.container},
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Downloads and loads slice of logs as specified by offsetFrom and offsetTo.
   * It works just like normal slicing, but indices are referenced relatively to certain reference
   * line.
   * So for example if reference line has index n and we want to download first 10 elements in array
   * we have to use
   * from -n to -n+10.
   */
  private loadView_(
    logFilePosition: LogControl,
    referenceTimestamp: LogControl,
    referenceLinenum: number,
    offsetFrom: number,
    offsetTo: number,
    onLoad?: Function
  ): void {
    const namespace = this.activatedRoute_.snapshot.params.resourceNamespace;
    const params = new HttpParams()
      .set('logFilePosition', logFilePosition)
      .set('referenceTimestamp', referenceTimestamp)
      .set('referenceLineNum', `${referenceLinenum}`)
      .set('offsetFrom', `${offsetFrom}`)
      .set('offsetTo', `${offsetTo}`)
      .set('previous', `${this.logService.getPrevious()}`);
    this.logService
      .getResource(`${namespace}/${this.pod}/${this.container}`, params)
      .pipe(take(1))
      .subscribe((podLogs: LogDetails) => {
        this.updateUiModel_(podLogs);
        if (onLoad) {
          onLoad();
        }
      });
  }

  /**
   * Starts and stops interval function used to automatically refresh logs.
   */
  private toggleIntervalFunction_(): void {
    if (!this.logService.getAutoRefresh()) {
      this.refreshUnsubscribe_.next();
      return;
    }

    merge(this.settingsService_.onSettingsUpdate, of(true))
      .pipe(
        switchMap(_ => {
          this.refreshInterval = this.settingsService_.getLogsAutoRefreshTimeInterval();
          const interval = this.refreshInterval * 1000;
          return timer(0, interval === 0 ? undefined : interval);
        })
      )
      .pipe(takeUntil(this.refreshUnsubscribe_))
      .subscribe(_ =>
        this.loadView_(
          LogControl.LoadEnd,
          LogControl.TimestampNewest,
          0,
          this.maxLogSize,
          this.maxLogSize + this.logsPerView
        )
      );
  }

  /**
   * Scrolls log view to the bottom of the page.
   */
  private scrollToBottom_(): void {
    this.scrollTo_('BOTTOM');
  }

  /**
   * Scrolls log view to the top of the page.
   */
  private scrollToTop_(): void {
    this.scrollTo_('TOP');
  }

  /**
   * Checks if the current logs scroll position is at the bottom.
   */
  private isScrolledBottom_(): boolean {
    const {nativeElement} = this.logViewContainer_;
    return nativeElement.scrollHeight <= nativeElement.scrollTop + nativeElement.clientHeight;
  }

  private scrollTo_(position: 'TOP' | 'BOTTOM'): void {
    const {nativeElement} = this.logViewContainer_;
    if (!nativeElement) {
      return;
    }

    let top;
    switch (position) {
      case 'TOP':
        top = 0;
        break;
      case 'BOTTOM':
        top = nativeElement.scrollHeight;
        break;
      default:
        return;
    }

    nativeElement.scrollTo({top, left: 0, behavior: 'smooth'});
  }
}
