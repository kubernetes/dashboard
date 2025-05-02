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

import {Component, DestroyRef, EventEmitter, inject, OnInit} from '@angular/core';
import {ReplaySubject, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'kd-card-list-filter',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class CardListFilterComponent implements OnInit {
  query = '';
  keyUpEvent = new Subject<string>();
  filterEvent = new EventEmitter<boolean>();
  openedChange = new ReplaySubject<boolean>();

  private hidden_ = true;
  private destroyRef = inject(DestroyRef);
  private readonly debounceTime_ = 500;

  ngOnInit(): void {
    this.keyUpEvent
      .pipe(debounceTime(this.debounceTime_), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
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
}
