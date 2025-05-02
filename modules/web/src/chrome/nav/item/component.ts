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

import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';
import {Component, DestroyRef, EventEmitter, HostListener, inject, Input, OnInit} from '@angular/core';
import {debounceTime, tap} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

enum NamespacedIndicatorState {
  Enter = 'mouseenter',
  Leave = 'mouseleave',
}

const rollInOut = trigger('rollInOut', [
  state(NamespacedIndicatorState.Enter, style({width: '72px', 'border-radius': '8px'})),
  state(NamespacedIndicatorState.Leave, style({width: '16px', 'border-radius': '50%'})),
  transition(`${NamespacedIndicatorState.Leave} => ${NamespacedIndicatorState.Enter}`, [
    animate(
      '.15s linear',
      keyframes([
        style({width: '16px', 'border-radius': '50%', color: 'rgba(0,0,0,0)'}),
        style({width: '72px', 'border-radius': '8px'}),
      ])
    ),
  ]),

  transition(`${NamespacedIndicatorState.Enter} => ${NamespacedIndicatorState.Leave}`, [
    animate(
      '.15s linear',
      keyframes([
        style({width: '72px', 'border-radius': '8px', color: 'rgba(0,0,0,0)'}),
        style({width: '16px', 'border-radius': '50%'}),
      ])
    ),
  ]),
]);

@Component({
  selector: 'kd-nav-item',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
  animations: [rollInOut],
})
export class NavItemComponent implements OnInit {
  @Input() state: string;
  @Input() exact = false;
  @Input() namespaced = false;
  @Input() animated = true;

  animationState = NamespacedIndicatorState.Leave;

  private mouseStateChanges_ = new EventEmitter<NamespacedIndicatorState>();
  private debounceTime_ = 500;
  private destroyRef = inject(DestroyRef);

  get indicator(): string {
    return this.animationState === NamespacedIndicatorState.Leave || !this.animated ? 'N' : 'Namespaced';
  }

  ngOnInit(): void {
    if (!this.animated) {
      return;
    }

    this.mouseStateChanges_
      // Trigger leave animation immediately, but delay enter animation
      .pipe(
        tap(
          state =>
            (this.animationState =
              state === NamespacedIndicatorState.Leave ? NamespacedIndicatorState.Leave : this.animationState)
        )
      )
      .pipe(debounceTime(this.debounceTime_))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => (this.animationState = state));
  }

  @HostListener('mouseenter', ['$event'])
  @HostListener('mouseleave', ['$event'])
  onHover(event: MouseEvent): void {
    this.mouseStateChanges_.emit(event.type as NamespacedIndicatorState);
  }
}
