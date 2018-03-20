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

import {EventEmitter, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ObjectMeta, TypeMeta} from '@api/backendapi';

import {DeleteResourceDialog} from '../../dialogs/deleteresource/dialog';

import {ResourceMeta} from './actionbar';

@Injectable()
export class VerberService {
  onDelete = new EventEmitter<boolean>();
  odEdit = new EventEmitter<boolean>();

  constructor(private readonly dialog_: MatDialog) {}

  showDeleteDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig: MatDialogConfig<ResourceMeta> = {
      width: '630px',
      data: {
        displayName,
        typeMeta,
        objectMeta,
      }
    };

    this.dialog_.open(DeleteResourceDialog, dialogConfig).afterClosed().subscribe((doDelete) => {
      if (doDelete) {
        const url = this.getRawResourceUrl(typeMeta, objectMeta);
        // todo delete
        this.onDelete.emit(true);
      }
    });
  }

  showEditDialog(displayName: string, typeMeta: TypeMeta, objectMeta: ObjectMeta): void {
    const dialogConfig: MatDialogConfig<ResourceMeta> = {
      width: '630px',
      data: {
        displayName,
        typeMeta,
        objectMeta,
      }
    };

    // todo
  }

  getRawResourceUrl(typeMeta: TypeMeta, objectMeta: ObjectMeta): string {
    let resourceUrl = `api/v1/_raw/${typeMeta.kind}`;
    if (objectMeta.namespace !== undefined) {
      resourceUrl += `/namespace/${objectMeta.namespace}`;
    }
    resourceUrl += `/name/${objectMeta.name}`;
    return resourceUrl;
  }

  // deleteErrorCb(err) {
  //   if (err) {
  //     const dialogConfig: MatDialogConfig<AlertDialogConfig> = {
  //       width: '630px',
  //       data: {
  //         title: err.statusText || 'Internal server error',
  //         // TODO Add || this.localizerService_.localize(err.data).
  //         message: 'Could not delete the resource',
  //         confirmLabel: 'OK',
  //       }
  //     };
  //   }
  // }
  //
  // editErrorCb(err) {
  //   if (err) {
  //     const dialogConfig: MatDialogConfig<AlertDialogConfig> = {
  //       width: '630px',
  //       data: {
  //         title: err.statusText || 'Internal server error',
  //         // TODO Add || this.localizerService_.localize(err.data).
  //         message: 'Could not edit the resource',
  //         confirmLabel: 'OK',
  //       }
  //     };
  //   }
  // }
}
