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

import {SharedModule} from '../../shared.module';
import {ComponentsModule} from '../components/module';

import {AlertDialog} from './alert/dialog';
import {DeleteResourceDialog} from './deleteresource/dialog';
import {LogsDownloadDialog} from './download/dialog';
import {EditResourceDialog} from './editresource/dialog';
import {RestartResourceDialog} from './restartresource/dialog';
import {ScaleResourceDialog} from './scaleresource/dialog';
import {TriggerResourceDialog} from './triggerresource/dialog';

@NgModule({
  imports: [SharedModule, ComponentsModule],
  declarations: [
    AlertDialog,
    EditResourceDialog,
    DeleteResourceDialog,
    LogsDownloadDialog,
    RestartResourceDialog,
    ScaleResourceDialog,
    TriggerResourceDialog,
  ],
  exports: [
    AlertDialog,
    EditResourceDialog,
    DeleteResourceDialog,
    LogsDownloadDialog,
    RestartResourceDialog,
    ScaleResourceDialog,
    TriggerResourceDialog,
  ],
  entryComponents: [
    AlertDialog,
    EditResourceDialog,
    DeleteResourceDialog,
    LogsDownloadDialog,
    RestartResourceDialog,
    ScaleResourceDialog,
    TriggerResourceDialog,
  ],
})
export class DialogsModule {}
