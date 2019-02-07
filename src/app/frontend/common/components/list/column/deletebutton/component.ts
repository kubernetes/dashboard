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

import {Component, Input} from '@angular/core';
import {ObjectMeta, TypeMeta} from '@api/backendapi';
import {ActionColumn} from '@api/frontendapi';
import {StateService} from '@uirouter/core';
import {first} from 'rxjs/operators';

import {VerberService} from '../../../../services/global/verber';

@Component({
  selector: 'kd-edit-button',
  templateUrl: './template.html',
})
export class DeleteButtonComponent implements ActionColumn {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;

  constructor(private readonly verber_: VerberService, private readonly _state: StateService) {}

  setObjectMeta(objectMeta: ObjectMeta): void {
    this.objectMeta = objectMeta;
  }

  setTypeMeta(typeMeta: TypeMeta): void {
    this.typeMeta = typeMeta;
  }

  perform(event: Event): void {
    event.stopPropagation();
    this.verber_.onDelete.pipe(first()).subscribe(() => this._state.reload());
    this.verber_.showDeleteDialog(this.typeMeta.kind, this.typeMeta, this.objectMeta);
  }
}
