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

import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {KdFile} from '@api/frontendapi';

import {CreateService} from '../../../common/services/create/service';
import {HistoryService} from '../../../common/services/global/history';
import {NamespaceService} from '../../../common/services/global/namespace';

@Component({
  selector: 'kd-create-from-file',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class CreateFromFileComponent {
  @ViewChild(NgForm, {static: true}) private readonly ngForm: NgForm;
  file: KdFile;

  constructor(
    private readonly namespace_: NamespaceService,
    private readonly create_: CreateService,
    private readonly history_: HistoryService,
  ) {}

  isCreateDisabled(): boolean {
    return !this.file || this.file.content.length === 0 || this.create_.isDeployDisabled();
  }

  create(): void {
    this.create_.createContent(this.file.content, true, this.file.name);
  }

  onFileLoad(file: KdFile): void {
    this.file = file;
  }

  cancel(): void {
    this.history_.goToPreviousState('overview');
  }

  areMultipleNamespacesSelected(): boolean {
    return this.namespace_.areMultipleNamespacesSelected();
  }
}
