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
import {PinnerService} from '../../../../services/global/pinner';

@Component({
  selector: 'kd-actionbar-detail-pin',
  templateUrl: './template.html',
})
export class ActionbarDetailPinComponent {
  @Input() objectMeta: ObjectMeta;
  @Input() typeMeta: TypeMeta;
  @Input() displayName: string;
  @Input() namespaced = false;

  constructor(private readonly pinner_: PinnerService) {}

  onClick(): void {
    if (this.isPinned()) {
      this.pinner_.unpin(this.typeMeta.kind, this.objectMeta.name, this.objectMeta.namespace);
    } else {
      this.pinner_.pin(
        this.typeMeta.kind,
        this.objectMeta.name,
        this.objectMeta.namespace,
        this.displayName,
        this.namespaced,
      );
    }
  }

  isPinned(): boolean {
    return this.pinner_.isPinned(this.typeMeta.kind, this.objectMeta.name, this.objectMeta.namespace);
  }
}
