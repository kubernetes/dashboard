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
import {CUSTOM_ELEMENTS_SCHEMA, InjectionToken} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {EnabledAuthenticationModes, LoginSkippableResponse, LoginSpec} from '@api/backendapi';
import {Config, CONFIG_DI_TOKEN} from '../index.config';
import {K8SError, KdError} from 'common/errors/errors';
import {AuthService} from 'common/services/global/authentication';
import {from, Observable, of} from 'rxjs';
import {LoginComponent} from './component';
import {PluginsConfigService} from '../common/services/global/plugin';
import {PluginMetadata} from '@api/frontendapi';

const queries = {
  submitButton: '.kd-login-button[type="submit"]',
  skipButton: '.kd-login-button:not([type="submit"])',
  errorText: '.kd-error-text',
  usernameId: '#username',
  passwordId: '#password',
};
const username = 'kubedude';
const password = 'supersecret';
const MOCK_CONFIG_DI_TOKEN = new InjectionToken<Config>('kd.config');

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

    // fake an error if password isn't what we expect.
    if (loginSpec && loginSpec.password === password) {
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

class MockPluginsConfigService {
  init(): void {}
  refreshConfig(): void {}
  static pluginsMetadata(): PluginMetadata[] {
    return [];
  }
  static status(): number {
    return 200;
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
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
          useValue: {
            paramMap: from([]),
          },
        },
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: PluginsConfigService,
          useClass: MockPluginsConfigService,
        },
        {
          provide: CONFIG_DI_TOKEN,
          useValue: MOCK_CONFIG_DI_TOKEN,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.get(HttpTestingController);
  });

  describe('initialization', () => {
    it('renders appropriate number of authentication mode mat-radio-buttons from api/v1/login/modes call', () => {
      const mockEnabledAuthenticationModes: EnabledAuthenticationModes = {
        modes: ['kubeconfig', 'basic', 'token', 'hard-mode', 'a-la-mode'],
      };
      fixture.detectChanges();
      const req = httpTestingController.expectOne('api/v1/login/modes');
      req.flush(mockEnabledAuthenticationModes);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('mat-radio-button')).length).toEqual(6);
    });

    it('renders skip button if login is skippable', () => {
      initializeForSkip();
      expect(fixture.debugElement.query(By.css(queries.skipButton))).toBeTruthy();
    });

    it('does not render skip button if login is not skippable', () => {
      const mockLoginSkippableResponse: LoginSkippableResponse = {
        skippable: false,
      };
      fixture.detectChanges();
      const req = httpTestingController.expectOne('api/v1/login/skippable');
      req.flush(mockLoginSkippableResponse);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(queries.skipButton))).toBeFalsy();
    });
  });

  describe('options', () => {
    it('renders token inputs if selectedAuthenticationMode === token', async () => {
      await setSelectedAuthenticationMode('token');
      expect(fixture.debugElement.query(By.css('#token'))).toBeTruthy();
    });

    it('renders user and password inputs if selectedAuthenticationMode === basic', async () => {
      await setSelectedAuthenticationMode('basic');
      expect(fixture.debugElement.query(By.css(queries.usernameId))).toBeTruthy();
      expect(fixture.debugElement.query(By.css(queries.passwordId))).toBeTruthy();
    });

    it('renders kd-upload-file if selectedAuthenticationMode === kubeconfig', async () => {
      await setSelectedAuthenticationMode('kubeconfig');
      expect(fixture.debugElement.query(By.css('kd-upload-file'))).toBeTruthy();
    });
  });

  describe('login', () => {
    it('calls AuthService.login with correct spec and redirects to overview', async () => {
      // setups spies in services
      const loginSpy = spyOn(TestBed.get(AuthService), 'login').and.callThrough();
      const navigateSpy = spyOn(TestBed.get(Router), 'navigate').and.callThrough();

      await setSelectedAuthenticationMode('basic');

      // set inputs and fire change events to trigger onChange()
      const usernameInput = fixture.debugElement.query(By.css(queries.usernameId)).nativeElement;
      const passwordInput = fixture.debugElement.query(By.css(queries.passwordId)).nativeElement;
      usernameInput.value = username;
      passwordInput.value = password;
      usernameInput.dispatchEvent(new Event('change'));
      passwordInput.dispatchEvent(new Event('change'));

      submit();

      expect(loginSpy).toHaveBeenCalledWith({username, password});
      expect(navigateSpy).toHaveBeenCalledWith(['overview']);
    });

    it('calls AuthService.login, does not redirect, and renders errors if login fails', async () => {
      // setups spies in services
      const loginSpy = spyOn(TestBed.get(AuthService), 'login').and.callThrough();
      const navigateSpy = spyOn(TestBed.get(Router), 'navigate').and.callThrough();

      await setSelectedAuthenticationMode('basic');

      submit();

      expect(loginSpy).toHaveBeenCalled();
      expect(fixture.debugElement.query(By.css(queries.errorText))).toBeTruthy();
      expect(navigateSpy).not.toHaveBeenCalledWith(['overview']);
    });
  });

  describe('skip', () => {
    it('calls AuthService.skipLoginPage and redirects to overview', async () => {
      initializeForSkip();
      fixture.debugElement.query(By.css(queries.skipButton)).nativeElement.click();

      // setups spies in services
      const skipLoginPageSpy = spyOn(TestBed.get(AuthService), 'skipLoginPage').and.callThrough();
      const navigateSpy = spyOn(TestBed.get(Router), 'navigate').and.callThrough();

      await setSelectedAuthenticationMode('basic');

      fixture.debugElement.query(By.css(queries.skipButton)).nativeElement.click();
      fixture.detectChanges();

      expect(skipLoginPageSpy).toHaveBeenCalledWith(true);
      expect(navigateSpy).toHaveBeenCalledWith(['overview']);
    });
  });

  const initializeForSkip = (): void => {
    const mockLoginSkippableResponse: LoginSkippableResponse = {
      skippable: true,
    };
    fixture.detectChanges();
    const req = httpTestingController.expectOne('api/v1/login/skippable');
    req.flush(mockLoginSkippableResponse);
    fixture.detectChanges();
  };

  const setSelectedAuthenticationMode = (mode: 'basic' | 'token' | 'kubeconfig'): Promise<void> => {
    (component.selectedAuthenticationMode as unknown) = mode;
    fixture.detectChanges();
    return fixture.whenStable();
  };

  const submit = (): void => {
    fixture.debugElement.query(By.css(queries.submitButton)).nativeElement.click();
    fixture.detectChanges();
  };
});
