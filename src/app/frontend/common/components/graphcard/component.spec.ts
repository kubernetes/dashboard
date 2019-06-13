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

import {SimpleChange} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Metric} from '@api/backendapi';

import {SharedModule} from '../../../shared.module';
import {CardComponent} from '../card/component';
import {GraphComponent} from '../graph/component';

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

  beforeEach(async(() => {
    TestBed
        .configureTestingModule({
          declarations: [GraphCardComponent, GraphComponent, CardComponent],
          imports: [SharedModule, NoopAnimationsModule],
        })
        .compileComponents();
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

  it('should return correct boolean with selectedMetric value', () => {
    const component = testHostFixture.componentInstance;
    expect(component.shouldShowGraph()).toBeFalsy();

    component.selectedMetricName = 'sum';
    component.selectedMetric = testMetrics[0];

    testHostFixture.detectChanges();
    expect(component.shouldShowGraph()).toBeTruthy();
  });

  it('should select correct metric from input metrics array', () => {
    const component = testHostFixture.componentInstance;
    component.ngOnChanges({
      metrics: new SimpleChange(null, testMetrics, true),
    });

    testHostFixture.detectChanges();

    component.selectedMetricName = testMetrics[0].metricName;
    component.selectedMetric = testMetrics[0];
    expect(component.selectedMetric.metricName).toBe(testMetrics[0].metricName);
  });
});
