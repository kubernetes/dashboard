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
import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {IConfig} from '@api/root.ui';
import {switchMap} from 'rxjs/operators';
import {AlertDialog, AlertDialogConfig} from '@common/dialogs/alert/dialog';
import {CsrfTokenService} from '@common/services/global/csrftoken';
import {CONFIG_DI_TOKEN} from '../../../../index.config';

export interface CreateNamespaceDialogMeta {
  namespaces: string[];
}

/**
 * Displays new namespace creation dialog.
 */
@Component({
  selector: 'kd-create-namespace-dialog',
  templateUrl: 'template.html',
})
export class CreateNamespaceDialog implements OnInit {
  form: FormGroup;

  /**
   * Max-length validation rule for namespace
   */
  namespaceMaxLength = 63;
  /**
   * Pattern validation rule for namespace
   */
  namespacePattern = new RegExp('^[a-z0-9]([-a-z0-9]*[a-z0-9])?$');

  constructor(
    public dialogRef: MatDialogRef<CreateNamespaceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: CreateNamespaceDialogMeta,
    private readonly http_: HttpClient,
    private readonly csrfToken_: CsrfTokenService,
    private readonly matDialog_: MatDialog,
    private readonly fb_: FormBuilder,
    @Inject(CONFIG_DI_TOKEN) private readonly appConfig_: IConfig
  ) {}

  ngOnInit(): void {
    this.form = this.fb_.group({
      namespace: [
        '',
        Validators.compose([Validators.maxLength(this.namespaceMaxLength), Validators.pattern(this.namespacePattern)]),
      ],
    });
  }

  get namespace(): AbstractControl {
    return this.form.get('namespace');
  }

  /**
   * Creates new namespace based on the state of the controller.
   */
  createNamespace(): void {
    if (!this.form.valid) return;

    const namespaceSpec = {name: this.namespace.value};

    const tokenPromise = this.csrfToken_.getTokenForAction('namespace');
    tokenPromise
      .pipe(
        switchMap(csrfToken =>
          this.http_.post<{valid: boolean}>(
            'api/v1/namespace',
            {...namespaceSpec},
            {headers: new HttpHeaders().set(this.appConfig_.csrfHeaderName, csrfToken.token)}
          )
        )
      )
      .subscribe(
        () => {
          this.dialogRef.close(this.namespace.value);
        },
        error => {
          this.dialogRef.close();
          const configData: AlertDialogConfig = {
            title: 'Error creating namespace',
            message: error.data,
            confirmLabel: 'OK',
          };
          this.matDialog_.open(AlertDialog, {data: configData});
        }
      );
  }

  /**
   * Returns true if new namespace name hasn't been filled by the user, i.e, is empty.
   */
  isDisabled(): boolean {
    return this.data.namespaces.indexOf(this.namespace.value) >= 0;
  }

  /**
   * Cancels the new namespace form.
   */
  cancel(): void {
    this.dialogRef.close();
  }
}
