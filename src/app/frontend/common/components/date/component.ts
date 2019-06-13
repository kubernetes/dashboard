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

/**
 * Display a date
 *
 * Examples:
 *
 * Display the date:
 * <kd-date [date]="object.timestamp"></kd-date>
 *
 * Display the age of the date, and the date in a tooltip:
 * <kd-date [date]="object.timestamp" relative></kd-date>
 *
 * Display the date in the shprt format:
 * <kd-date [date]="object.timestamp" format="short"></kd-date>
 *
 * Display the age of the date, and the date in the short format in a tooltip:
 * <kd-date [date]="object.timestamp" relative format="short"></kd-date>
 *
 */
@Component({
  selector: 'kd-date',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class DateComponent {
  @Input() date: string;
  @Input() format = 'medium';

  _relative: boolean;
  @Input('relative')
  set relative(v: boolean) {
    this._relative = v !== undefined && v !== false;
  }
}
