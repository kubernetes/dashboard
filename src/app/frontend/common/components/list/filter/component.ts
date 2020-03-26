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

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'kd-card-list-filter',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class CardListFilterComponent implements OnInit, OnDestroy {
  query = '';
  keyUpEvent = new Subject<string>();
  filterEvent = new EventEmitter<boolean>();
  openedChange = new ReplaySubject<boolean>();

  private hidden_ = true;
  private readonly debounceTime_ = 500;
  private readonly unsubscribe_ = new Subject<void>();

  ngOnInit(): void {
    this.keyUpEvent
      .debounceTime(this.debounceTime_)
      .distinctUntilChanged()
      .pipe(takeUntil(this.unsubscribe_))
      .subscribe(this.onFilterTriggered_.bind(this));
  }

  private onFilterTriggered_(newVal: string): void {
    this.query = newVal;
    this.filterEvent.emit(true);
  }

  isSearchVisible(): boolean {
    return !this.hidden_;
  }

  switchSearchVisibility(event: Event): void {
    event.stopPropagation();
    this.hidden_ = !this.hidden_;
    this.openedChange.next(!this.hidden_);
  }

  clearInput(event: Event): void {
    this.switchSearchVisibility(event);
    // Do not call backend if it is not needed
    if (this.query.length > 0) {
      this.query = '';
      this.filterEvent.emit(true);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe_.next();
    this.unsubscribe_.complete();
  }
}
