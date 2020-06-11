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

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {GlobalSettingsService} from '../../services/global/globalsettings';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateComponent implements OnInit, OnDestroy {
  @Input() date: string;
  @Input() format = 'medium';

  _relative: boolean;
  changeIteration = 0;
  @Input('relative')
  set relative(v: boolean) {
    this._relative = v !== undefined && v !== false;
  }
  private _unsubscribe = new Subject<void>();

  constructor(private readonly settings_: GlobalSettingsService, private readonly cdr_: ChangeDetectorRef) {}

  ngOnInit() {
    this.settings_.onSettingsUpdate
      .pipe(
        switchMap(() => {
          let interval = this.settings_.getResourceAutoRefreshTimeInterval();
          interval = interval === 0 ? undefined : interval * 1000;
          return timer(0, interval);
        }),
      )
      .pipe(filter(() => this._relative))
      .pipe(takeUntil(this._unsubscribe))
      .subscribe(() => {
        this.changeIteration++;
        this.cdr_.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }
}
