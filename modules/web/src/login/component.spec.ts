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

import {HttpClientTestingModule} from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, InjectionToken} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {LoginSpec} from '@api/root.api';
import {IConfig} from '@api/root.ui';
import {K8SError, KdError} from '@common/errors/errors';
import {AuthService} from '@common/services/global/authentication';
import {HistoryService} from '@common/services/global/history';
import {from, Observable, of, throwError} from 'rxjs';
import {CONFIG_DI_TOKEN} from '../index.config';
import {LoginComponent} from './component';

const queries = {
  submitButton: '.kd-login-button[type="submit"]',
  skipButton: '.kd-login-button:not([type="submit"])',
  errorText: '.kd-error-text',
  token: '#token',
};
const loginToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const MOCK_CONFIG_DI_TOKEN = new InjectionToken<IConfig>('kd.config');

class MockAuthService {
  login(loginSpec: LoginSpec): Observable<K8SError[]> {
    const errors = [
      {
        toKdError: (): KdError => {
          return {} as KdError;
        },
        ErrStatus: {
          message: 'a fake error',
          code: 999,
          status: 'fake',
          reason: 'testing',
        },
      },
    ];

    // fake an error if token isn't what we expect.
    if (loginSpec && loginSpec.token === loginToken) {
      return of([]);
    }
    return of(errors);
  }

  skipLoginPage(): void {}

  isLoginEnabled(): boolean {
    return true;
  }
}

class MockRouter {
  navigate(): void {}
}

class MockHistoryService {
  router_: MockRouter;

  init(): void {}

  pushState(): void {}

  goToPreviousState(): void {}
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatButtonModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],

      // inject mocks
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: ActivatedRoute,
          // useClass: MockActivatedRoute,
          useValue: {
            paramMap: from([]),
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: CONFIG_DI_TOKEN,
          useValue: MOCK_CONFIG_DI_TOKEN,
        },
        {
          provide: HistoryService,
          useClass: MockHistoryService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
  });

  describe('options', () => {
    it('renders token inputs', async () => {
      expect(fixture.debugElement.query(By.css('#token'))).toBeTruthy();
    });
  });

  describe('login', () => {
    it('calls AuthService.login with correct spec and redirects to overview', async () => {
      // setups spies in services
      const loginSpy = jest.spyOn(TestBed.inject(AuthService), 'login');
      const goToPreviousStateSpy = jest.spyOn(TestBed.inject(HistoryService), 'goToPreviousState');

      // set inputs and fire change events to trigger onChange()
      const token = fixture.debugElement.query(By.css(queries.token)).nativeElement;
      token.value = loginToken;
      token.dispatchEvent(new Event('input'));

      submit();

      expect(loginSpy).toHaveBeenCalledWith({token: loginToken} as LoginSpec);
      expect(goToPreviousStateSpy).toHaveBeenCalledWith('workloads');
    });

    it('calls AuthService.login, does not redirect, and renders errors if login fails', async () => {
      // setups spies in services
      const err = {status: 401, error: 'Unauthorized (401): Invalid credentials provided'};
      const loginSpy = jest.spyOn(TestBed.inject(AuthService), 'login').mockReturnValue(throwError(err));
      const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate');

      // set inputs and fire change events to trigger onChange()
      const token = fixture.debugElement.query(By.css(queries.token)).nativeElement;
      token.value = loginToken;
      token.dispatchEvent(new Event('change'));

      submit();

      expect(loginSpy).toHaveBeenCalled();
      expect(fixture.debugElement.query(By.css(queries.errorText))).toBeTruthy();
      expect(navigateSpy).not.toHaveBeenCalledWith(['overview']);
    });
  });

  const submit = (): void => {
    fixture.debugElement.query(By.css(queries.submitButton)).nativeElement.click();
    fixture.detectChanges();
  };
});
