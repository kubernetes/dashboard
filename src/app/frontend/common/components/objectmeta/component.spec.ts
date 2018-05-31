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

import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { ObjectMetaComponent } from './component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { By } from "@angular/platform-browser";
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { MatIconModule, MatCardModule, MatDividerModule, MatTooltipModule, MatTooltip, MatDialogModule, MatChipsModule } from '@angular/material';
import { ObjectMeta, AppConfig } from '@api/backendapi';
import { PipesModule } from '../../pipes/module';
import { ConfigService } from '../../services/global/config';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CardComponent } from '../card/component';
import { PropertyComponent } from '../property/component';
import { ChipsComponent } from 'common/components/chips/component';
import { RelativeTimeFormatter } from '../../pipes/relativetime';

let miniName = "my-mini-meta-name";

@Component({
    selector: 'test',
    templateUrl: './template.html'
    // template: `
    // <kd-object-meta [initialized]="initialized"
    //             [objectMeta]="objectMeta"></kd-object-meta>   
    // `
})
class TestComponent {
    initialized = true;
    objectMeta: ObjectMeta = {
        name: miniName,
        namespace: "my-namespace",
        "labels": {
            "addonmanager.kubernetes.io/mode": "Reconcile",
            "app": "kubernetes-dashboard",
            "pod-template-hash": "1054779233",
            "version": "v1.8.1"
        },
        creationTimestamp: "2018-05-18T22:27:42Z"
    }
}

fdescribe('ObjectMetaComponent', () => {

    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let httpMock: HttpTestingController;
    let configService: ConfigService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ObjectMetaComponent, TestComponent, CardComponent, PropertyComponent, ChipsComponent
            ],
            imports: [
                MatIconModule, MatCardModule, MatDividerModule, MatTooltipModule, MatDialogModule, MatChipsModule, NoopAnimationsModule, PipesModule, HttpClientTestingModule, MatIconModule
            ],
            providers: [ConfigService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        httpMock = TestBed.get(HttpTestingController);
        configService = TestBed.get(ConfigService);
    }));

    beforeEach(() => {
        configService.init();
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        let configRequest = httpMock.expectOne('config');
        let config: AppConfig = { serverTime: new Date().getTime() };
        configRequest.flush(config);

        // httpMock.verify();
    });

    fit("shows a simple meta", () => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            // let card = fixture.debugElement.query(By.css('mat-card-title'));
            // expect(card).toBeTruthy();
            // const content = card.query(By.css('div[content]'));
            // expect(content).toBeFalsy();

            // htmlElement = debugElement.nativeElement;
            // console.log(htmlElement.innerHTML)
        });
    });




});

