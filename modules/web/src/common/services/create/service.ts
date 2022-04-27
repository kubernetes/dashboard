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

import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {AppDeploymentContentResponse, AppDeploymentContentSpec, AppDeploymentSpec} from '@api/root.api';
import {IConfig} from '@api/root.ui';
import {AsKdError} from '@common/errors/errors';
import {CONFIG_DI_TOKEN} from '../../../index.config';
import {AlertDialog, AlertDialogConfig} from '../../dialogs/alert/dialog';
import {CsrfTokenService} from '../global/csrftoken';
import {NamespaceService} from '../global/namespace';

const i18n = {
  /** Text shown on failed deploy in error dialog. */
  MSG_DEPLOY_DIALOG_ERROR: 'Deploying file has failed',

  /** Text shown on partly completed deploy in error dialog. */
  MSG_DEPLOY_DIALOG_PARTIAL_COMPLETED: 'Deployment has been partly completed',

  /** Title for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_TITLE: 'Validation error occurred',

  /** Content for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_CONTENT: 'Would you like to deploy anyway?',

  /** Confirmation text for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_OK: 'Yes',

  /** Cancellation text for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_CANCEL: 'No',
};

@Injectable()
export class CreateService {
  private isDeployInProgress_ = false;

  constructor(
    private readonly http_: HttpClient,
    private readonly namespace_: NamespaceService,
    private readonly csrfToken_: CsrfTokenService,
    private readonly matDialog_: MatDialog,
    private readonly router_: Router,
    @Inject(CONFIG_DI_TOKEN) private readonly CONFIG: IConfig
  ) {}

  async createContent(content: string, validate = true, name = ''): Promise<AppDeploymentContentResponse> {
    const spec: AppDeploymentContentSpec = {
      name,
      namespace: this.namespace_.current(),
      content,
      validate,
    };

    let response: AppDeploymentContentResponse;
    let error: HttpErrorResponse;

    try {
      const {token} = await this.csrfToken_.getTokenForAction('appdeploymentfromfile').toPromise();
      this.isDeployInProgress_ = true;
      response = await this.http_
        .post<AppDeploymentContentResponse>('api/v1/appdeploymentfromfile', spec, {
          headers: {[this.CONFIG.csrfHeaderName]: token},
        })
        .toPromise();
      if (response.error.length > 0) {
        this.reportError_(i18n.MSG_DEPLOY_DIALOG_PARTIAL_COMPLETED, response.error);
      }
    } catch (err) {
      error = err;
    }
    this.isDeployInProgress_ = false;

    if (error) {
      this.reportError_(i18n.MSG_DEPLOY_DIALOG_ERROR, AsKdError(error).message);
      throw error;
    }

    return response;
  }

  async deploy(spec: AppDeploymentSpec): Promise<AppDeploymentContentResponse> {
    let response: AppDeploymentContentResponse;
    let error: HttpErrorResponse;

    try {
      const {token} = await this.csrfToken_.getTokenForAction('appdeployment').toPromise();
      this.isDeployInProgress_ = true;
      response = await this.http_
        .post<AppDeploymentContentResponse>('api/v1/appdeployment', spec, {
          headers: {[this.CONFIG.csrfHeaderName]: token},
        })
        .toPromise();
    } catch (err) {
      error = err;
    }
    this.isDeployInProgress_ = false;

    if (error) {
      this.reportError_(i18n.MSG_DEPLOY_DIALOG_ERROR, AsKdError(error).message);
      throw error;
    }

    return response;
  }

  isDeployDisabled(): boolean {
    return this.isDeployInProgress_;
  }

  private reportError_(title: string, message: string): void {
    const configData: AlertDialogConfig = {
      title,
      message,
      confirmLabel: 'OK',
    };
    this.matDialog_.open(AlertDialog, {data: configData});
  }
}
