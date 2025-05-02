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
import {ObjectMeta} from '@api/root.api';
import {KdStateService} from '@common/services/global/state';
import {Resource} from '@common/services/resource/endpoint';

@Component({
  selector: 'kd-object-meta',
  templateUrl: './template.html',
})
export class ObjectMetaComponent {
  @Input() initialized = false;

  private objectMeta_: ObjectMeta;

  constructor(private readonly stateService_: KdStateService) {}

  get objectMeta(): ObjectMeta {
    return this.objectMeta_;
  }

  getOwnerHref(kind: string, name: string): string {
    const normalizedKind = kind.toLowerCase();

    if (!Object.values(Resource).includes(normalizedKind as Resource)) {
      return '';
    }

    return this.stateService_?.href(normalizedKind, name, this.objectMeta_.namespace);
  }

  @Input()
  set objectMeta(val: ObjectMeta) {
    if (val === undefined) {
      this.objectMeta_ = {} as ObjectMeta;
    } else {
      this.objectMeta_ = val;
    }
  }
}
