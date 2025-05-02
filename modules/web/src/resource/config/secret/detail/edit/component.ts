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

import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {SecretDetail} from '@api/root.api';
import {DecoderService} from '@common/services/global/decoder';
import {RawResource} from 'common/resources/rawresource';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {AlertDialogConfig, AlertDialogComponent} from 'common/dialogs/alert/dialog';
import {MatDialogConfig, MatDialog} from '@angular/material/dialog';
import {encode} from 'js-base64';

@Component({
  selector: 'kd-secret-detail-edit',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class SecretDetailEditComponent implements OnInit {
  @Output() closeEvent = new EventEmitter<boolean>();
  @Input() key: string;

  text = '';

  private secret_: SecretDetail;
  private editing_ = false;

  @Input() set editing(value: boolean) {
    this.editing_ = value;
    this.updateText_();
  }

  get editing(): boolean {
    return this.editing_;
  }

  @Input() set secret(value: SecretDetail) {
    this.secret_ = value;
  }

  get secret(): SecretDetail {
    return this.secret_;
  }

  constructor(
    private readonly dialog_: MatDialog,
    private readonly http_: HttpClient,
    private readonly decoder_: DecoderService
  ) {}

  ngOnInit(): void {
    this.updateText_();
  }

  update(): void {
    // Get the latest raw resource, and update it.
    const url = RawResource.getUrl(this.secret.typeMeta, this.secret.objectMeta);
    this.http_
      .get(url)
      .toPromise()
      .then((resource: any) => {
        const dataValue = this.encode_(this.text);
        resource.data[this.key] = dataValue;
        const url = RawResource.getUrl(this.secret.typeMeta, this.secret.objectMeta);
        this.http_.put(url, resource, {headers: this.getHttpHeaders_(), responseType: 'text'}).subscribe(() => {
          // Update current data value for secret, so refresh isn't needed.
          this.secret_.data[this.key] = dataValue;
          this.closeEvent.emit(true);
        }, this.handleErrorResponse_.bind(this));
      });
  }

  cancel(): void {
    this.closeEvent.emit(true);
  }

  private updateText_(): void {
    this.text = this.secret && this.key ? this.decoder_.base64(this.secret.data[this.key]) : '';
  }

  private encode_(s: string): string {
    // Use js-base64 library instead of `btoa`, since we need to encode a UTF-8 string,
    // however `btoa` only supports binary input (latin1 range).
    return encode(s, false);
  }

  private getHttpHeaders_(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  }

  private handleErrorResponse_(err: HttpErrorResponse): void {
    if (err) {
      const alertDialogConfig: MatDialogConfig<AlertDialogConfig> = {
        width: '630px',
        data: {
          title: err.statusText === 'OK' ? 'Internal server error' : err.statusText,
          message: err.error || 'Could not perform the operation.',
          confirmLabel: 'OK',
        },
      };
      this.dialog_.open(AlertDialogComponent, alertDialogConfig);
    }
  }
}
