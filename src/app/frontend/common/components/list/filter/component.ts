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

import {Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'kd-card-list-filter',
  templateUrl: './template.html',
  styleUrls: ['style.scss'],
})
export class CardListFilterComponent implements OnInit {
  @ViewChild('filterInput', {static: true}) private readonly filterInput_: ElementRef;
  private hidden_ = true;
  keyUpEvent = new Subject<string>();
  query = '';
  filterEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.keyUpEvent
      .debounceTime(500)
      .distinctUntilChanged()
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

    if (!this.hidden_) {
      this.focusInput();
    }
  }

  focusInput(): void {
    // Small timeout is required as input is not yet rendered when method is fired right after
    // clicking on filter button.
    setTimeout(() => {
      this.filterInput_.nativeElement.focus();
    }, 150);
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
