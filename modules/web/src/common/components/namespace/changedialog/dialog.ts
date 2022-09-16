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

@Component({
  selector: 'kd-namespace-change-dialog',
  templateUrl: 'template.html',
})
export class NamespaceChangeDialog {
  namespace: string;
  newNamespace: string;

  constructor(
    public dialogRef: MatDialogRef<NamespaceChangeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {namespace: string; newNamespace: string}
  ) {
    this.namespace = data.namespace;
    this.newNamespace = data.newNamespace;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
