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
import {AfterViewInit, DestroyRef, Directive, ElementRef, inject, Input} from '@angular/core';
import {Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Directive({
  selector: '[kdAutofocus]',
})
export class AutofocusDirective implements AfterViewInit {
  @Input() opened: Observable<boolean>;

  private destroyRef = inject(DestroyRef);
  constructor(private readonly _el: ElementRef) {}

  ngAfterViewInit(): void {
    if (!this.opened) {
      throw new Error('[opened] event binding is undefined');
    }

    this.opened
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(opened => (opened ? setTimeout(() => this._el.nativeElement.focus()) : null));
  }
}
