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

import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ObjectMeta, TypeMeta} from '@api/root.api';
import {filter, switchMap} from 'rxjs/operators';

import {AlertDialog, AlertDialogConfig} from '../../dialogs/alert/dialog';
import {DeleteResourceDialog} from '../../dialogs/deleteresource/dialog';
import {EditResourceDialog} from '../../dialogs/editresource/dialog';
import {RestartResourceDialog} from '../../dialogs/restartresource/dialog';
import {ScaleResourceDialog} from '../../dialogs/scaleresource/dialog';
import {TriggerResourceDialog} from '../../dialogs/triggerresource/dialog';
import {RawResource} from '../../resources/rawresource';

import {ResourceMeta} from './actionbar';

@Injectable()
export class VerberService {
  onDelete = new EventEmitter<boolean>();
  onEdit = new EventEmitter<boolean>();
  onScale = new EventEmitter<boolean>();
  onTrigger = new EventEmitter<boolean>();
  onRestart = new EventEmitter<boolean>();

  constructor(private readonly dialog_: MatDialog, private readonly http_: HttpClient) {}

  showDeleteDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_
      .open(DeleteResourceDialog, dialogConfig)
      .afterClosed()
      .pipe(filter(doDelete => doDelete))
      .pipe(
        switchMap(_ => {
          const url = RawResource.getUrl(typeMeta, objectMeta);
          return this.http_.delete(url, {responseType: 'text'});
        })
      )
      .subscribe(_ => this.onDelete.emit(true), this.handleErrorResponse_.bind(this));
  }

  showEditDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_
      .open(EditResourceDialog, dialogConfig)
      .afterClosed()
      .pipe(filter(result => result))
      .pipe(
        switchMap(result => {
          const url = RawResource.getUrl(typeMeta, objectMeta);
          return this.http_.put(url, JSON.parse(result), {headers: this.getHttpHeaders_(), responseType: 'text'});
        })
      )
      .subscribe(_ => this.onEdit.emit(true), this.handleErrorResponse_.bind(this));
  }

  showRestartDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_
      .open(RestartResourceDialog, dialogConfig)
      .afterClosed()
      .pipe(filter(result => result))
      .pipe(
        switchMap(_ => {
          const url = `api/v1/${typeMeta.kind}/${objectMeta.namespace}/${objectMeta.name}/restart`;
          return this.http_.put(url, {responseType: 'text'});
        })
      )
      .subscribe(_ => this.onTrigger.emit(true), this.handleErrorResponse_.bind(this));
  }

  showScaleDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_
      .open(ScaleResourceDialog, dialogConfig)
      .afterClosed()
      .pipe(filter(result => Number.isInteger(result)))
      .pipe(
        switchMap(result => {
          const url = `api/v1/scale/${typeMeta.kind}${objectMeta.namespace ? `/${objectMeta.namespace}` : ''}/${
            objectMeta.name
          }/`;

          return this.http_.put(url, {scaleBy: result}, {params: {scaleBy: result}});
        })
      )
      .subscribe(_ => this.onScale.emit(true), this.handleErrorResponse_.bind(this));
  }

  showTriggerDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_
      .open(TriggerResourceDialog, dialogConfig)
      .afterClosed()
      .pipe(filter(result => result))
      .pipe(
        switchMap(_ => {
          const url = `api/v1/cronjob/${objectMeta.namespace}/${objectMeta.name}/trigger`;
          return this.http_.put(url, {}, {responseType: 'text'});
        })
      )
      .subscribe(_ => this.onTrigger.emit(true), this.handleErrorResponse_.bind(this));
  }

  getDialogConfig_(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): MatDialogConfig<ResourceMeta> {
    return {width: '900px', data: {displayName, typeMeta, objectMeta}};
  }

  handleErrorResponse_(err: HttpErrorResponse): void {
    if (err) {
      const alertDialogConfig: MatDialogConfig<AlertDialogConfig> = {
        width: '630px',
        data: {
          title: err.statusText === 'OK' ? 'Internal server error' : err.statusText,
          message: err.error || 'Could not perform the operation.',
          confirmLabel: 'OK',
        },
      };
      this.dialog_.open(AlertDialog, alertDialogConfig);
    }
  }

  getHttpHeaders_(): HttpHeaders {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  }
}
