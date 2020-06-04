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
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {AppConfig} from '@api/backendapi';
import {ResourcesRatio} from '@api/frontendapi';

import {ConfigService} from '../../services/global/config';
import {CardComponent} from '../card/component';

import {WorkloadStatusComponent} from './component';

const testResourcesRatio: ResourcesRatio = {
  cronJobRatio: [],
  daemonSetRatio: [
    {name: 'Running: 1', value: 100},
    {name: 'Failed: 0', value: 0},
    {name: 'Pending: 0', value: 0},
  ],
  deploymentRatio: [
    {name: 'Running: 1', value: 50},
    {name: 'Failed: 1', value: 50},
    {name: 'Pending: 0', value: 0},
  ],
  jobRatio: [],
  podRatio: [
    {name: 'Running: 10', value: 83.33333333333334},
    {name: 'Failed: 2', value: 16.666666666666664},
    {name: 'Pending: 0', value: 0},
    {name: 'Succeeded: 0', value: 0},
  ],
  replicaSetRatio: [
    {name: 'Running: 1', value: 50},
    {name: 'Failed: 1', value: 50},
    {name: 'Pending: 0', value: 0},
  ],
  replicationControllerRatio: [
    {name: 'Running: 2', value: 100},
    {name: 'Failed: 0', value: 0},
    {name: 'Pending: 0', value: 0},
  ],
  statefulSetRatio: [],
};

describe('WorkloadStatusComponent', () => {
  let httpMock: HttpTestingController;
  let configService: ConfigService;
  let testHostFixture: ComponentFixture<WorkloadStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CardComponent, WorkloadStatusComponent],
      imports: [
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        MatTooltipModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        FlexLayoutModule,
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

    testHostFixture = TestBed.createComponent(WorkloadStatusComponent);
  });

  it('shows component heading', () => {
    testHostFixture.detectChanges();
    const debugElement = testHostFixture.debugElement.query(By.css('kd-card mat-card mat-card-title div'));
    expect(debugElement).toBeTruthy();

    const htmlElement = debugElement.nativeElement;
    expect(htmlElement.innerText).toContain('Workload Status');
  });

  it('does not show cron jobs status', () => {
    const component = testHostFixture.componentInstance;
    component.resourcesRatio = testResourcesRatio;

    testHostFixture.detectChanges();
    const debugElements = testHostFixture.debugElement.queryAll(
      By.css('kd-card mat-card div mat-card-content div.kd-graph-title'),
    );

    debugElements.forEach(debugElement => {
      const htmlElement = debugElement.nativeElement;
      expect(htmlElement.innerText === 'Cron Jobs').toBeFalsy();
    });
  });

  it('shows pod status', () => {
    const component = testHostFixture.componentInstance;
    component.resourcesRatio = testResourcesRatio;

    testHostFixture.detectChanges();
    const debugElement = testHostFixture.debugElement.query(By.css('#kd-graph-pods'));
    expect(debugElement).toBeTruthy();
  });
});
