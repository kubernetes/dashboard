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

export enum HiddenPropertyMode {
  hidden = 'hidden',
  visible = 'visible',
  edit = 'edit',
}

@Component({
  selector: 'kd-hidden-property',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class HiddenPropertyComponent {
  @Input() mode = HiddenPropertyMode.hidden;
  @Input() enableEdit = false;
  HiddenPropertyMode = HiddenPropertyMode;

  toggleVisible(): void {
    // Allow toggle between visible and hidden with eye icon and key.
    this.mode =
      this.mode !== HiddenPropertyMode.visible
        ? HiddenPropertyMode.visible
        : HiddenPropertyMode.hidden;
  }

  toggleEdit(event: MouseEvent): void {
    // Prevent standard visible.
    event.stopPropagation();

    // Allow toggle between edit and hidden with pencil icon.
    this.mode =
      this.mode !== HiddenPropertyMode.edit ? HiddenPropertyMode.edit : HiddenPropertyMode.hidden;
  }
}
