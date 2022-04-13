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
import {waitForAsync, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {AppConfig, ObjectMeta} from '@api/root.api';
import {CardComponent} from '@common/components/card/component';
import {PropertyComponent} from '@common/components/property/component';
import {PipesModule} from '@common/pipes/module';
import {ConfigService} from '@common/services/global/config';
import {MESSAGES, MESSAGES_DI_TOKEN} from '../../../index.messages';

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
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ObjectMetaComponent, TestComponent, CardComponent, PropertyComponent],
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
      providers: [ConfigService, {provide: MESSAGES_DI_TOKEN, useValue: MESSAGES}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(ConfigService);
  }));

  beforeEach(() => {
    configService.init();
    const configRequest = httpMock.expectOne('config');
    const config: AppConfig = {serverTime: new Date().getTime()};
    configRequest.flush(config);
  });

  it('shows a simple meta', () => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('mat-card-title'));
    expect(card).toBeTruthy();

    const metaName = fixture.debugElement.query(By.css('kd-property.object-meta-name div.kd-property-value'));
    expect(metaName).toBeTruthy();
    expect(metaName.nativeElement.textContent === miniName);
  });
});
