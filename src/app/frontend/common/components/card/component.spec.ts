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

import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MESSAGES, MESSAGES_DI_TOKEN} from '../../../index.messages';

import {CardComponent} from './component';

@Component({
  selector: 'test',
  template: `
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <kd-card [expanded]="isExpanded" [expandable]="isExpandable" role="table">
      <div title>{{ title }}</div>
      <div description>Description: default</div>
      <div actions>Actions: default</div>
      <div content>Content: default</div>
      <div footer>Footer: default</div>
    </kd-card>
  `,
})
class TestComponent {
  title = 'my-card-default-title';
  isExpanded = true;
  isExpandable = true;
}

describe('CardComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardComponent, TestComponent],
      imports: [MatIconModule, MatCardModule, MatDividerModule, MatTooltipModule, NoopAnimationsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{provide: MESSAGES_DI_TOKEN, useValue: MESSAGES}],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('shows the title div when withTitle==true', () => {
    const title = 'my-card-default-expanded';

    component.title = title;

    component.isExpanded = true;
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('mat-card-title'));
    expect(card).toBeTruthy();
    const content = card.query(By.css('div[content]'));
    expect(content).toBeFalsy();
    const titleNative = card.query(By.css('div[title] ')).nativeElement;
    expect(titleNative.innerHTML).toBe(title);
  });

  it('hides the title div when withTitle==false', () => {
    const title = 'my-card-default-not-expanded';

    component.title = title;
    component.isExpanded = false;
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('mat-card-title'));
    expect(card).toBeTruthy();
    const content = card.query(By.css('div[content]'));
    expect(content).toBeFalsy();
    const titleNative = card.query(By.css('div[title] ')).nativeElement;
    expect(titleNative.innerHTML).toBe(title);
  });
});
