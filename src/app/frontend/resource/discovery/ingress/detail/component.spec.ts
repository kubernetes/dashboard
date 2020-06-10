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
import {Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {AppConfig, IngressDetail, ObjectMeta} from '@api/backendapi';
import {CardComponent} from 'common/components/card/component';
import {ChipsComponent} from 'common/components/chips/component';
import {ObjectMetaComponent} from 'common/components/objectmeta/component';
import {PropertyComponent} from 'common/components/property/component';
import {PipesModule} from 'common/pipes/module';
import {ConfigService} from 'common/services/global/config';

import {IngressDetailComponent} from './component';

const miniName = 'my-mini-ingress';
const maxiName = 'my-maxi-ingress';

@Component({selector: 'test', templateUrl: './template.html'})
class MiniTestComponent {
  isInitialized = true;
  ingress: IngressDetail = {
    objectMeta: {
      name: miniName,
      namespace: 'my-namespace',
      labels: {},
      creationTimestamp: '2018-05-18T22:27:42Z',
    },
    typeMeta: {kind: 'Ingress'},
    errors: [],
  };
}

@Component({selector: 'test', templateUrl: './template.html'})
class MaxiTestComponent {
  isInitialized = true;
  ingress: IngressDetail = {
    objectMeta: {
      name: maxiName,
      namespace: 'my-namespace',
      labels: {
        'addonmanager.kubernetes.io/mode': 'Reconcile',
        app: 'kubernetes-dashboard',
        'pod-template-hash': '1054779233',
        version: 'v1.8.1',
      },
      creationTimestamp: '2018-05-18T22:27:42Z',
    },
    typeMeta: {kind: 'Ingress'},
    errors: [],
  };
}

describe('IngressDetailComponent', () => {
  let httpMock: HttpTestingController;
  let configService: ConfigService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ObjectMetaComponent,
        MaxiTestComponent,
        MiniTestComponent,
        CardComponent,
        PropertyComponent,
        ChipsComponent,
        IngressDetailComponent,
      ],
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
    const configRequest = httpMock.expectOne('config');
    const config: AppConfig = {serverTime: new Date().getTime()};
    configRequest.flush(config);

    // httpMock.verify();
  });

  it('shows a mini ingress', () => {
    const fixture = TestBed.createComponent(MiniTestComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('kd-property.object-meta-name div.kd-property-value div'));
    expect(debugElement).toBeTruthy();

    const htmlElement = debugElement.nativeElement;
    expect(htmlElement.innerHTML).toBe(miniName);
  });

  it('shows a maxi ingress', () => {
    const fixture = TestBed.createComponent(MaxiTestComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    const debugElement = fixture.debugElement.query(By.css('kd-property.object-meta-name div.kd-property-value div'));
    expect(debugElement).toBeTruthy();

    const htmlElement = debugElement.nativeElement;
    expect(htmlElement.innerHTML).toBe(maxiName);
  });
});
