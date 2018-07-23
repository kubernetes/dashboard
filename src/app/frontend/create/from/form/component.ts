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

import {Component, Input, OnInit} from '@angular/core';
import {CreateService} from '../../../common/services/create/service';
import {HistoryService} from '../../../common/services/global/history';
import {NamespaceService} from '../../../common/services/global/namespace';
import {overviewState} from '../../../overview/state';

// TODO
@Component(
    {selector: 'kd-create-from-form', templateUrl: './template.html', styleUrls: ['./style.scss']})
export class CreateFromFormComponent {
  readonly namePattern = new RegExp('^[a-z]([-a-z0-9]*[a-z0-9])?$');
  readonly nameMaxLength = 24;

  name = '';

  constructor(
      private readonly namespace_: NamespaceService, private readonly create_: CreateService,
      private readonly history_: HistoryService) {}

  isCreateDisabled(): boolean {
    return this.create_.isDeployDisabled();
  }

  create(): void {}

  cancel(): void {
    this.history_.goToPreviousState(overviewState.name);
  }

  areMultipleNamespacesSelected(): boolean {
    return this.namespace_.areMultipleNamespacesSelected();
  }

  get namespace(): string {
    return this.namespace_.current();
  }
}
