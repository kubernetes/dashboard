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

import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {AppConfig, ObjectMeta} from '@api/backendapi';
import {ChipsComponent} from 'common/components/chips/component';

import {PipesModule} from '../../pipes/module';
import {ConfigService} from '../../services/global/config';
import {CardComponent} from '../card/component';
import {PropertyComponent} from '../property/component';

import {ObjectMetaComponent} from './component';

const miniName = 'my-mini-meta-name';

@Component({selector: 'test', templateUrl: './template.html'})
class TestComponent {
  initialized = true;
  objectMeta: ObjectMeta = {
    name: miniName,
    namespace: 'my-namespace',
    labels: {
      'addonmanager.kubernetes.io/mode': 'Reconcile',
      app: 'kubernetes-dashboard',
      'pod-template-hash': '1054779233',
      version: 'v1.8.1',
    },
    creationTimestamp: '2018-05-18T22:27:42Z',
  };
}

describe('ObjectMetaComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectMetaComponent, TestComponent, CardComponent, PropertyComponent, ChipsComponent],
      imports: [
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        MatTooltipModule,
        MatDialogModule,
        MatChipsModule,
        NoopAnimationsModule,
        PipesModule,
        HttpClientTestingModule,
        MatIconModule,
        RouterModule,
      ],
      providers: [ConfigService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    httpMock = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
  }));

  beforeEach(() => {
    configService.init();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    const configRequest = httpMock.expectOne('config');
    const config: AppConfig = {serverTime: new Date().getTime()};
    configRequest.flush(config);

    // httpMock.verify();
  });

  it('shows a simple meta', () => {
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('mat-card-title'));
    expect(card).toBeTruthy();

    const metaName = fixture.debugElement.query(By.css('kd-property.object-meta-name div.kd-property-value'));
    expect(metaName).toBeTruthy();
    expect(metaName.nativeElement.textContent === miniName);
  });
});
