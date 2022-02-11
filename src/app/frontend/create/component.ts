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
import {ICanDeactivate} from '@common/interfaces/candeactivate';
import {CreateFromFileComponent} from './from/file/component';
import {CreateFromFormComponent} from './from/form/component';
import {CreateFromInputComponent} from './from/input/component';

@Component({
  selector: 'kd-create',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class CreateComponent extends ICanDeactivate {
  @ViewChild(CreateFromInputComponent) fromInput: CreateFromInputComponent;
  @ViewChild(CreateFromFileComponent) fromFile: CreateFromFileComponent;
  @ViewChild(CreateFromFormComponent) fromForm: CreateFromFormComponent;

  canDeactivate(): boolean {
    return this.fromInput.canDeactivate() && this.fromFile.canDeactivate() && this.fromForm.canDeactivate();
  }
}
