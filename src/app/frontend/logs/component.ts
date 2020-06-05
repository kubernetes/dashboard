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
import {LogDetails, LogLine, LogSelection, LogSources} from '@api/backendapi';
import {GlobalSettingsService} from 'common/services/global/globalsettings';
import {LogService} from 'common/services/global/logs';
import {NotificationSeverity, NotificationsService} from 'common/services/global/notifications';
import {Subject, Subscription, timer} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';

import {LogsDownloadDialog} from '../common/dialogs/download/dialog';

const logsPerView = 100;
const maxLogSize = 2e9;
// Load logs from the beginning of the log file. This matters only if the log file is too large to
// be loaded completely.
const beginningOfLogFile = 'beginning';
// Load logs from the end of the log file. This matters only if the log file is too large to be
// loaded completely.
const endOfLogFile = 'end';
const oldestTimestamp = 'oldest';
const newestTimestamp = 'newest';

const i18n = {
  MSG_LOGS_ZEROSTATE_TEXT: 'The selected container has not logged any messages yet.',
  MSG_LOGS_TRUNCATED_WARNING: 'The middle part of the log file cannot be loaded, because it is too big.',
};

type ScrollPosition = 'TOP' | 'BOTTOM';

@Component({
  selector: 'kd-logs',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class LogsComponent implements OnDestroy {
  private unsubscribe_ = new Subject<void>();

  readonly refreshInterval: number;

  @ViewChild('logViewContainer', {static: true}) logViewContainer_: ElementRef;

  podLogs: LogDetails;
  logsSet: string[];
  logSources: LogSources;
  pod: string;
  container: string;
  logService: LogService;
  totalItems = 0;
  itemsPerPage = 10;
  currentSelection: LogSelection;
  intervalSubscription: Subscription;
  sourceSubscription: Subscription;
  logsSubscription: Subscription;
  isLoading: boolean;
  logsAutorefreshEnabled = false;

  constructor(
    logService: LogService,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly settingsService_: GlobalSettingsService,
    private readonly dialog_: MatDialog,
    private readonly notifications_: NotificationsService,
    private readonly _router: Router,
  ) {
    this.logService = logService;
    this.isLoading = true;
    this.refreshInterval = this.settingsService_.getLogsAutoRefreshTimeInterval();

    const namespace = this.activatedRoute_.snapshot.params.resourceNamespace;
    const resourceType = this.activatedRoute_.snapshot.params.resourceType;
    const resourceName = this.activatedRoute_.snapshot.params.resourceName;
    const containerName = this.activatedRoute_.snapshot.queryParams.container;

    this.sourceSubscription = logService
      .getResource(`source/${namespace}/${resourceName}/${resourceType}`)
      .subscribe((data: LogSources) => {
        this.logSources = data;
        this.pod = data.podNames[0]; // Pick first pod (cannot use resource name as it may
        // not be a pod).
        this.container = containerName ? containerName : data.containerNames[0]; // Pick from URL or first.
        this.appendContainerParam();

        this.logsSubscription = this.logService
          .getResource(`${namespace}/${this.pod}/${this.container}`)
          .subscribe((data: LogDetails) => {
            this.updateUiModel(data);
            this.isLoading = false;
          });
      });
  }

  ngOnDestroy(): void {
    this._router.navigate([], {
      queryParams: {['container']: null},
      queryParamsHandling: 'merge',
    });

    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    if (this.sourceSubscription) {
      this.sourceSubscription.unsubscribe();
    }
    if (this.logsSubscription) {
      this.logsSubscription.unsubscribe();
    }
  }

  /**
   * Updates all state parameters and sets the current log view with the data returned from the
   * backend If logs are not available sets logs to no logs available message.
   */
  updateUiModel(podLogs: LogDetails): void {
    this.podLogs = podLogs;
    this.currentSelection = podLogs.selection;
    this.logsSet = this.formatAllLogs(podLogs.logs);
    if (podLogs.info.truncated) {
      this.notifications_.push(i18n.MSG_LOGS_TRUNCATED_WARNING, NotificationSeverity.error);
    }

    if (this.logService.getFollowing()) {
      // Pauses very slightly for the view to refresh.
      setTimeout(() => {
        this.scrollToBottom();
      });
    }
  }

  formatAllLogs(logs: LogLine[]): string[] {
    if (logs.length === 0) {
      logs = [{timestamp: '0', content: i18n.MSG_LOGS_ZEROSTATE_TEXT}];
    }
    return logs.map(line => this.formatLine(line));
  }

  formatLine(line: LogLine): string {
    // add timestamp if needed
    const showTimestamp = this.logService.getShowTimestamp();
    return showTimestamp ? `${line.timestamp}  ${line.content}` : line.content;
  }

  appendContainerParam() {
    this._router.navigate([], {
      queryParams: {['container']: this.container},
      queryParamsHandling: 'merge',
    });
  }

  onContainerChange() {
    this.appendContainerParam();
    this.loadNewest();
  }

  /**
   * Loads maxLogSize oldest lines of logs.
   */
  loadOldest(): void {
    this.loadView(beginningOfLogFile, oldestTimestamp, 0, -maxLogSize - logsPerView, -maxLogSize);
  }

  /**
   * Loads maxLogSize newest lines of logs.
   */
  loadNewest(): void {
    this.loadView(endOfLogFile, newestTimestamp, 0, maxLogSize, maxLogSize + logsPerView);
  }

  /**
   * Shifts view by maxLogSize lines to the past.
   */
  loadOlder(): void {
    this.loadView(
      this.currentSelection.logFilePosition,
      this.currentSelection.referencePoint.timestamp,
      this.currentSelection.referencePoint.lineNum,
      this.currentSelection.offsetFrom - logsPerView,
      this.currentSelection.offsetFrom,
      this.scrollToBottom.bind(this),
    );
  }

  /**
   * Shifts view by maxLogSize lines to the future.
   */
  loadNewer(): void {
    this.loadView(
      this.currentSelection.logFilePosition,
      this.currentSelection.referencePoint.timestamp,
      this.currentSelection.referencePoint.lineNum,
      this.currentSelection.offsetTo,
      this.currentSelection.offsetTo + logsPerView,
      this.scrollToTop.bind(this),
    );
  }

  /**
   * Downloads and loads slice of logs as specified by offsetFrom and offsetTo.
   * It works just like normal slicing, but indices are referenced relatively to certain reference
   * line.
   * So for example if reference line has index n and we want to download first 10 elements in array
   * we have to use
   * from -n to -n+10.
   */
  loadView(
    logFilePosition: string,
    referenceTimestamp: string,
    referenceLinenum: number,
    offsetFrom: number,
    offsetTo: number,
    onLoad?: Function,
  ): void {
    const namespace = this.activatedRoute_.snapshot.params.resourceNamespace;
    const params = new HttpParams()
      .set('logFilePosition', logFilePosition)
      .set('referenceTimestamp', referenceTimestamp)
      .set('referenceLineNum', `${referenceLinenum}`)
      .set('offsetFrom', `${offsetFrom}`)
      .set('offsetTo', `${offsetTo}`)
      .set('previous', `${this.logService.getPrevious()}`);
    this.logsSubscription = this.logService
      .getResource(`${namespace}/${this.pod}/${this.container}`, params)
      .subscribe((podLogs: LogDetails) => {
        this.updateUiModel(podLogs);
        if (onLoad) {
          onLoad();
        }
      });
  }

  onTextColorChange(): void {
    this.logService.setInverted();
  }

  onFontSizeChange(): void {
    this.logService.setCompact();
  }

  onShowTimestamp(): void {
    this.logService.setShowTimestamp();
    this.logsSet = this.formatAllLogs(this.podLogs.logs);
  }

  /**
   * Execute when a user changes the selected option for show previous container logs.
   * @export
   */
  onPreviousChange(): void {
    this.logService.setPrevious();
    this.loadNewest();
  }

  /**
   * Toggles log auto-refresh mechanism.
   */
  toggleLogAutoRefresh(): void {
    this.logService.setAutoRefresh();
    this.toggleIntervalFunction();
  }

  /**
   * Toggles log follow mechanism.
   */
  toggleLogFollow(): void {
    this.logService.toggleFollowing();
  }

  /**
   * Starts and stops interval function used to automatically refresh logs.
   */
  toggleIntervalFunction(): void {
    this.logsAutorefreshEnabled = !this.logsAutorefreshEnabled;
    if (!this.logsAutorefreshEnabled) {
      this.unsubscribe_.next();
      return;
    }

    this.settingsService_.onSettingsUpdate
      .pipe(
        switchMap(_ => {
          const interval = this.settingsService_.getLogsAutoRefreshTimeInterval() * 1000;
          return timer(0, interval === 0 ? undefined : interval);
        }),
      )
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(_ => this.loadNewest());
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
    this.logService.setFollowing(this.isScrolledBottom());
  }

  /**
   * Checks if the current logs scroll position is at the bottom.
   */
  isScrolledBottom(): boolean {
    const {nativeElement} = this.logViewContainer_;
    return nativeElement.scrollHeight <= nativeElement.scrollTop + nativeElement.clientHeight;
  }

  /**
   * Scrolls log view to the bottom of the page.
   */
  scrollToBottom(): void {
    this.scrollTo('BOTTOM');
  }

  /**
   * Scrolls log view to the top of the page.
   */
  scrollToTop(): void {
    this.scrollTo('TOP');
  }

  scrollTo(position: ScrollPosition): void {
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
