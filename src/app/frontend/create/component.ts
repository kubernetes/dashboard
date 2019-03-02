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

import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {equals, StateDeclaration, StateService, TransitionService} from '@uirouter/core';

import {DialogService} from '../common/services/global/confirmbox';


@Component({
  selector: 'kd-create',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class CreateComponent {
  canExit: boolean;

  constructor(
      public $state: StateService, public dialogService: DialogService,
      public transitionService: TransitionService) {}

  uiCanExit() {
    if (!localStorage.getItem('editting')) {
      return true;
    }

    const message = 'You have unsaved changes to this contact.';
    const question = 'Navigate away and lose changes?';
    return this.dialogService.confirm(message, question);
  }
}
