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
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import {RawResource} from '../../resources/rawresource';
import {ObjectMeta, TypeMeta, SecretDetail, ConfigMapDetail} from '@api/backendapi';

export class QuickEditMeta {
  resourceKey: string;
  objectMeta: ObjectMeta;
  typeMeta: TypeMeta;

  constructor(resourceKey: string, objectMeta: ObjectMeta, typeMeta: TypeMeta) {
    this.resourceKey = resourceKey;
    this.objectMeta = objectMeta;
    this.typeMeta = typeMeta;
  }
}

@Component({
  selector: 'kd-quick-edit-dialog',
  templateUrl: 'template.html',
})
export class QuickEditDialog implements OnInit {
  text = '';

  private resourceDetail_: SecretDetail | ConfigMapDetail;

  constructor(
    public dialogRef: MatDialogRef<QuickEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: QuickEditMeta,
    private readonly http_: HttpClient,
  ) {}

  ngOnInit(): void {
    const url = RawResource.getUrl(this.data.typeMeta, this.data.objectMeta);
    this.http_
      .get(url)
      .toPromise()
      .then(response => {
        this.resourceDetail_ = response as SecretDetail | ConfigMapDetail;
        this.text = atob(this.resourceDetail_.data[this.data.resourceKey]);
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getJSON(): string {
    if (!this.resourceDetail_) {
      return '';
    }

    this.resourceDetail_.data[this.data.resourceKey] = btoa(this.text);
    return this.toRawJSON(this.resourceDetail_);
  }

  private toRawJSON(object: {}): string {
    return JSON.stringify(object, null, '\t');
  }
}
