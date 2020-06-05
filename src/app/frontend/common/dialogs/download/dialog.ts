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

import {HttpClient, HttpEventType, HttpRequest, HttpResponse} from '@angular/common/http';
import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import {Subscription} from 'rxjs';

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
  result: Blob;
  downloadSubscription: Subscription;
  error: number;

  constructor(
    public dialogRef: MatDialogRef<LogsDownloadDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LogsDownloadDialogMeta,
    private readonly logService: LogService,
    private readonly http_: HttpClient,
  ) {
    const logUrl = `api/v1/log/file/${data.namespace}/${data.pod}/${
      data.container
    }?previous=${this.logService.getPrevious()}`;

    this.downloadSubscription = this.http_
      .request(new HttpRequest('GET', logUrl, {}, {reportProgress: true, responseType: 'blob'}))
      .subscribe(
        event => {
          if (event.type === HttpEventType.DownloadProgress) {
            this.loaded = event.loaded;
          } else if (event instanceof HttpResponse) {
            this.finished = true;
            // @ts-ignore
            this.result = new Blob([event.body], {type: 'text/plan'});
          }
        },
        error => {
          this.error = error.status;
        },
      );
  }

  ngOnDestroy(): void {
    if (this.downloadSubscription) {
      this.downloadSubscription.unsubscribe();
    }
  }

  hasForbiddenError(): boolean {
    return this.error !== undefined && this.error === 403;
  }

  save(): void {
    FileSaver.saveAs(this.result, this.logService.getLogFileName(this.data.pod, this.data.container));
    this.dialogRef.close();
  }

  abort(): void {
    if (this.downloadSubscription) {
      this.downloadSubscription.unsubscribe();
    }
    this.dialogRef.close();
  }

  getDownloadMode(): string {
    return this.finished ? 'determinate' : 'indeterminate';
  }
}
