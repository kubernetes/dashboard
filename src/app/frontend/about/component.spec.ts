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
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppConfig} from '@api/backendapi';
import {SharedModule} from 'shared.module';
import {CardComponent} from '../common/components/card/component';
import {AssetsService} from '../common/services/global/assets';
import {ConfigService} from '../common/services/global/config';
import {AboutComponent} from './component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let httpMock: HttpTestingController;
  let configService: ConfigService;
  let element: HTMLElement;

  // set the predefined values
  const copyrightYear = 2019;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule, BrowserAnimationsModule],
      declarations: [AboutComponent, CardComponent],
      providers: [AssetsService, ConfigService],
    }).compileComponents();
    httpMock = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
  }));

  beforeEach(async(() => {
    // prepare the component
    configService.init();
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;

    const configRequest = httpMock.expectOne('config');
    const config: AppConfig = {serverTime: new Date().getTime()};
    configRequest.flush(config);

    // set the fixed values
    component.latestCopyrightYear = copyrightYear;

    // grab the HTML element
    element = fixture.debugElement.query(By.css('kd-card')).nativeElement;
  }));

  it('should print current year', async(() => {
    fixture.detectChanges();
    expect(element.textContent).toContain(`2015 - ${copyrightYear}`);
  }));
});
