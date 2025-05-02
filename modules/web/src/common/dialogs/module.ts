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

import {NgModule} from '@angular/core';
import {ConfirmDialogComponent} from '@common/dialogs/config/dialog';

import {SharedModule} from '../../shared.module';
import {ComponentsModule} from '../components/module';

import {AlertDialogComponent} from './alert/dialog';
import {DeleteResourceDialogComponent} from './deleteresource/dialog';
import {LogsDownloadDialogComponent} from './download/dialog';
import {EditResourceDialogComponent} from './editresource/dialog';
import {RestartResourceDialogComponent} from './restartresource/dialog';
import {ScaleResourceDialogComponent} from './scaleresource/dialog';
import {TriggerResourceDialogComponent} from './triggerresource/dialog';
import {PreviewDeploymentDialogComponent} from './previewdeployment/dialog';

@NgModule({
  imports: [SharedModule, ComponentsModule],
  declarations: [
    AlertDialogComponent,
    EditResourceDialogComponent,
    DeleteResourceDialogComponent,
    LogsDownloadDialogComponent,
    RestartResourceDialogComponent,
    ScaleResourceDialogComponent,
    TriggerResourceDialogComponent,
    ConfirmDialogComponent,
    PreviewDeploymentDialogComponent,
  ],
  exports: [
    AlertDialogComponent,
    EditResourceDialogComponent,
    DeleteResourceDialogComponent,
    LogsDownloadDialogComponent,
    RestartResourceDialogComponent,
    ScaleResourceDialogComponent,
    TriggerResourceDialogComponent,
    PreviewDeploymentDialogComponent,
  ],
})
export class DialogsModule {}
