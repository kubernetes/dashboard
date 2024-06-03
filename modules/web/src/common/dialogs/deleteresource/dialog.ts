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

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ResourceMeta} from '../../services/global/actionbar';

enum DeletionPropagation {
  DeletePropagationBackground = 'Background',
  DeletePropagationForeground = 'Foreground',
  DeletePropagationOrphan = 'Orphan',
}

export interface DeleteOptions {
  deleteNow: boolean;
  propagation: DeletionPropagation;
}

@Component({
  selector: 'kd-delete-resource-dialog',
  templateUrl: 'template.html',
  styleUrls: ['./styles.scss'],
})
export class DeleteResourceDialogComponent {
  options: DeleteOptions;

  constructor(
    public dialogRef: MatDialogRef<DeleteResourceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResourceMeta
  ) {
    this.options = {
      deleteNow: false,
      propagation: DeletionPropagation.DeletePropagationBackground,
    };
  }

  protected readonly DeletionPropagation = DeletionPropagation;
}
