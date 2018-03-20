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

import {HttpClient} from '@angular/common/http';
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {RawResource} from '../../resources/rawresource';
import {ResourceMeta} from '../../services/global/actionbar';

@Component({
  selector: 'kd-delete-resource-dialog',
  templateUrl: 'template.html',
})
export class EditResourceDialog implements OnInit {
  rawJson = '';

  constructor(
      public dialogRef: MatDialogRef<EditResourceDialog>,
      @Inject(MAT_DIALOG_DATA) public data: ResourceMeta, private readonly http_: HttpClient) {}

  ngOnInit(): void {
    const url = RawResource.getUrl(this.data.typeMeta, this.data.objectMeta);
    this.http_.get(url).toPromise().then((response) => {
      this.rawJson = JSON.stringify(response, null, '\t');
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
