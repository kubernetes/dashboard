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

import {HttpClient, HttpEventType, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogOptions} from '@api/root.api';
import {saveAs} from 'file-saver';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {LogService} from '../../services/global/logs';

export interface LogsDownloadDialogMeta {
  pod: string;
  container: string;
  namespace: string;
}

@Component({
  selector: 'kd-logs-download-dialog',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class LogsDownloadDialog implements OnDestroy {
  loaded = 0;
  finished = false;

  private _result: Blob;
  private _error: number;
  private _unsubscribe = new Subject<void>();

  private get _logOptions(): LogOptions {
    return {
      previous: this.logService.getPrevious(),
      timestamps: this.logService.getShowTimestamp(),
    };
  }

  constructor(
    private readonly _dialogRef: MatDialogRef<LogsDownloadDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LogsDownloadDialogMeta,
    private readonly logService: LogService,
    private readonly http_: HttpClient
  ) {
    const logUrl = `api/v1/log/file/${data.namespace}/${data.pod}/${data.container}`;

    this.http_
      .request(
        new HttpRequest(
          'GET',
          logUrl,
          {},
          {reportProgress: true, responseType: 'blob', params: new HttpParams({fromObject: this._logOptions})}
        )
      )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(
        event => {
          if (event.type === HttpEventType.DownloadProgress) {
            this.loaded = event.loaded;
          } else if (event instanceof HttpResponse) {
            this.finished = true;
            this._result = new Blob([event.body as BlobPart], {type: 'text/plan'});
          }
        },
        error => (this._error = error.status)
      );
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  hasForbiddenError(): boolean {
    return this._error !== undefined && this._error === 403;
  }

  save(): void {
    saveAs(this._result, this.logService.getLogFileName(this.data.pod, this.data.container));
    this._dialogRef.close();
  }

  abort(): void {
    this._dialogRef.close();
  }

  getDownloadMode(): string {
    return this.finished ? 'determinate' : 'indeterminate';
  }
}
