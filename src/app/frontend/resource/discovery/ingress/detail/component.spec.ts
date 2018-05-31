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
import { IngressDetailComponent } from './component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { By } from "@angular/platform-browser";
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { MatIconModule, MatCardModule, MatDividerModule, MatTooltipModule, MatTooltip, MatDialogModule, MatChipsModule } from '@angular/material';
import { ObjectMeta, AppConfig, IngressDetail } from '@api/backendapi';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChipsComponent } from 'common/components/chips/component';
import { ObjectMetaComponent } from 'common/components/objectmeta/component';
import { CardComponent } from 'common/components/card/component';
import { PropertyComponent } from 'common/components/property/component';
import { ConfigService } from 'common/services/global/config';
import { PipesModule } from 'common/pipes/module';

let miniName = "my-mini-ingress";
let maxiName = "my-maxi-ingress";

@Component({
    selector: 'test',
    templateUrl: './template.html'
})
class MiniTestComponent {
    isInitialized = true;
    ingress: IngressDetail = {
        objectMeta: {
            name: miniName,
            namespace: "my-namespace",
            "labels": {
            },
            creationTimestamp: "2018-05-18T22:27:42Z"
        },
        typeMeta: {
            kind: "Ingress"
        },
        errors: []
    }
}

@Component({
    selector: 'test',
    templateUrl: './template.html'
})
class MaxiTestComponent {
    isInitialized = true;
    ingress: IngressDetail = {
        objectMeta: {
            name: maxiName,
            namespace: "my-namespace",
            "labels": {
                "addonmanager.kubernetes.io/mode": "Reconcile",
                "app": "kubernetes-dashboard",
                "pod-template-hash": "1054779233",
                "version": "v1.8.1"
            },
            creationTimestamp: "2018-05-18T22:27:42Z"
        },
        typeMeta: {
            kind: "Ingress"
        },
        errors: []
    }
}

fdescribe('IngressDetailComponent', () => {

    let httpMock: HttpTestingController;
    let configService: ConfigService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ObjectMetaComponent, MaxiTestComponent, MiniTestComponent, CardComponent, PropertyComponent, ChipsComponent, IngressDetailComponent
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
        let configRequest = httpMock.expectOne('config');
        let config: AppConfig = { serverTime: new Date().getTime() };
        configRequest.flush(config);

        // httpMock.verify();
    });

    it("shows a mini ingress", () => {
        let fixture = TestBed.createComponent(MiniTestComponent);
        let component = fixture.componentInstance;


        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let debugElement = fixture.debugElement.query(By.css('kd-property.object-meta-name div.kd-property-value div'));
            expect(debugElement).toBeTruthy();

            let htmlElement = debugElement.nativeElement;
            expect(htmlElement.innerHTML).toBe(miniName);

        });
    });

    it("shows a maxi ingress", () => {
        let fixture = TestBed.createComponent(MaxiTestComponent);
        let component = fixture.componentInstance;


        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let debugElement = fixture.debugElement.query(By.css('kd-property.object-meta-name div.kd-property-value div'));
            expect(debugElement).toBeTruthy();

            let htmlElement = debugElement.nativeElement;
            expect(htmlElement.innerHTML).toBe(maxiName);

        });
    });


});

