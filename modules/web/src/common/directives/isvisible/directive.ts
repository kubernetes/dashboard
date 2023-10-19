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

import {AfterViewInit, Directive, EventEmitter, Output, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[kdIsVisible]',
})
export class IsVisibleDirective implements AfterViewInit {
  @Output() visibilityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private readonly _viewContainerRef: ViewContainerRef) {}

  ngAfterViewInit(): void {
    const observedElement = this._viewContainerRef.element.nativeElement.parentElement;
    const observer = new IntersectionObserver(([entry]) => this.visibilityChange.emit(entry.isIntersecting));

    observer.observe(observedElement);
  }
}
