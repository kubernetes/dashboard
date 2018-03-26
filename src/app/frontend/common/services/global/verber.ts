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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EventEmitter, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ObjectMeta, TypeMeta} from '@api/backendapi';

import {AlertDialog, AlertDialogConfig} from '../../dialogs/alert/dialog';
import {DeleteResourceDialog} from '../../dialogs/deleteresource/dialog';
import {EditResourceDialog} from '../../dialogs/editresource/dialog';
import {RawResource} from '../../resources/rawresource';

import {ResourceMeta} from './actionbar';

@Injectable()
export class VerberService {
  onDelete = new EventEmitter<boolean>();
  onEdit = new EventEmitter<boolean>();

  constructor(private readonly dialog_: MatDialog, private readonly http_: HttpClient) {}

  showDeleteDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_.open(DeleteResourceDialog, dialogConfig).afterClosed().subscribe((doDelete) => {
      if (doDelete) {
        const url = RawResource.getUrl(typeMeta, objectMeta);
        this.http_.delete(url).subscribe(() => {
          this.onDelete.emit(true);
        }, this.handleErrorResponse_);
      }
    });
  }

  showEditDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig = this.getDialogConfig_(displayName, typeMeta, objectMeta);
    this.dialog_.open(EditResourceDialog, dialogConfig).afterClosed().subscribe((result) => {
      if (result) {
        const url = RawResource.getUrl(typeMeta, objectMeta);
        this.http_.put(url, JSON.parse(result), {headers: this.getHttpHeaders_()}).subscribe(() => {
          this.onEdit.emit(true);
        }, this.handleErrorResponse_);
      }
    });
  }

  getDialogConfig_(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta):
      MatDialogConfig<ResourceMeta> {
    return {width: '630px', data: {displayName, typeMeta, objectMeta}};
  }

  handleErrorResponse_(err: Response): void {
    if (err) {
      const alertDialogConfig: MatDialogConfig<AlertDialogConfig> = {
        width: '630px',
        data: {
          title: err.statusText || 'Internal server error',
          // TODO Add || this.localizerService_.localize(err.data).
          message: 'Could not perform the operation',
          confirmLabel: 'OK',
        }
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
