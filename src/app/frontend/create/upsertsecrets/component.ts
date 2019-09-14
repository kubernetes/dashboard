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
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CONFIG} from '../../index.config';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CsrfTokenService} from '../../common/services/global/csrftoken';
import {NamespaceService} from '../../common/services/global/namespace';
import {AlertDialog, AlertDialogConfig} from '../../common/dialogs/alert/dialog';
import {HelpSectionComponent} from '../from/form/helpsection/component';
import {UserHelpComponent} from '../from/form/helpsection/userhelp/component';
import {HistoryService} from '../../common/services/global/history';
import {Router} from '@angular/router';

export interface UpsertSecretResponse {
  name: string;
  data: string;
  error: string;
}
export interface UpsertSecretSpec {
  name: string;
  namespace: string;
  data: string;
}

const i18n = {
  MSG_UPSERT_SECRETS_ERROR: 'Creating secret has failed',
};

@Component({
  selector: 'kd-upsert-secrets',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})

// export interface UpsertSecretsComponentMeta {
//   namespace: string;
// }
export class UpsertSecretsComponent {
  form: FormGroup;

  private readonly config_ = CONFIG;

  /**
   * Max-length validation rule for secretName.
   */
  secretNameMaxLength = 253;

  /**
   * Pattern validation rule for secretName.
   */
  secretNamePattern = new RegExp(
    '^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$',
  );

  /**
   * Pattern validating if the secret data is Base64 encoded.
   */
  dataPattern = new RegExp('^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$');

  constructor(
    // @Inject(MAT_DIALOG_DATA) public data_: UpsertSecretsComponentMeta,
    // Need method to get namespace here!
    private readonly namespace_: NamespaceService,
    private readonly http_: HttpClient,
    private readonly csrfToken_: CsrfTokenService,
    // private readonly matDialog_: MatDialog,
    private readonly fb_: FormBuilder,
    private readonly history_: HistoryService,
    private readonly matDialog_: MatDialog,
    private readonly router_: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb_.group({
      secretName: [
        '',
        Validators.compose([
          Validators.maxLength(this.secretNameMaxLength),
          Validators.pattern(this.secretNamePattern),
        ]),
      ],
      data: ['', Validators.pattern(this.dataPattern)],
    });
  }

  get secretName(): AbstractControl {
    return this.form.get('secretName');
  }

  get data(): AbstractControl {
    return this.form.get('data');
  }
  cancel(): void {
    this.history_.goToPreviousState('overview');
  }
  async createSecret(): Promise<UpsertSecretResponse> {
    if (!this.form.valid) return null;

    const secretSpec: UpsertSecretSpec = {
      name: this.secretName.value,
      namespace: this.namespace_.current(),
      data: this.data.value,
    };

    let response: UpsertSecretResponse;
    let error: HttpErrorResponse;

    try {
      const {token} = await this.csrfToken_.getTokenForAction('secret').toPromise();

      response = await this.http_
        .post<UpsertSecretResponse>('api/v1/secret', secretSpec, {
          headers: new HttpHeaders().set(this.config_.csrfHeaderName, token),
        })
        .toPromise();
      if (response.error) {
        this.reportError(i18n.MSG_UPSERT_SECRETS_ERROR, response.error);
      }
    } catch (err) {
      console.log(error);
      error = err;
    }
    if (error) {
      this.reportError(i18n.MSG_UPSERT_SECRETS_ERROR, error.error);
      throw error;
    } else {
      this.router_.navigate(['overview']);
    }
    return response;
  }
  private reportError(title: string, message: string): void {
    const configData: AlertDialogConfig = {
      title,
      message,
      confirmLabel: 'OK',
    };
    this.matDialog_.open(AlertDialog, {data: configData});
  }
}
