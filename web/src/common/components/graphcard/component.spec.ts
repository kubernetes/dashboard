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

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Metric} from '@api/root.api';
import {CardComponent} from '@common/components/card/component';
import {GraphComponent, GraphType} from '@common/components/graph/component';
import {InViewportModule, InViewportService} from 'ng-in-viewport';
import {SharedModule} from '../../../shared.module';

import {GraphCardComponent} from './component';

const testMetrics: Metric[] = [
  {dataPoints: [{x: 1, y: 1}], metricName: 'cpu/usage', aggregation: 'sum'},
  {
    dataPoints: [{x: 1, y: 1}],
    metricName: 'memory/usage',
    aggregation: 'sum',
  },
];

describe('GraphCardComponent', () => {
  let testHostFixture: ComponentFixture<GraphCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GraphCardComponent, GraphComponent, CardComponent],
      providers: [InViewportService],
      imports: [SharedModule, NoopAnimationsModule, InViewportModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    testHostFixture = TestBed.createComponent(GraphCardComponent);
  });

  it('should instantiate', () => {
    const component = testHostFixture.componentInstance;
    expect(component).toBeDefined();
  });

  it('should start with empty metrics', () => {
    const component = testHostFixture.componentInstance;
    expect(component.metrics).toBeUndefined();
  });

  it('should start with null selectedMetric', () => {
    const component = testHostFixture.componentInstance;
    expect(component.selectedMetric).toBeUndefined();
  });

  // TODO: fix this spec
  xit('should show graph when metrics are provided', () => {
    const component = testHostFixture.componentInstance;
    expect(component.shouldShowGraph()).toBeFalsy();

    component.graphTitle = 'CPU';
    component.selectedMetricName = 'cpu/usage';
    component.selectedMetric = testMetrics[0];
    component.graphType = GraphType.CPU;

    testHostFixture.detectChanges();
    expect(component.shouldShowGraph()).toBeTruthy();
  });
});
