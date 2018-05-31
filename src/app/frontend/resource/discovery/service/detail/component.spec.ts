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
import { ServiceDetailComponent } from './component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { By } from "@angular/platform-browser";
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { MatIconModule, MatCardModule, MatDividerModule, MatTooltipModule, MatTooltip, MatDialogModule, MatChipsModule } from '@angular/material';
import { ObjectMeta, AppConfig, ServiceDetail } from '@api/backendapi';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChipsComponent } from 'common/components/chips/component';
import { ObjectMetaComponent } from 'common/components/objectmeta/component';
import { CardComponent } from 'common/components/card/component';
import { PropertyComponent } from 'common/components/property/component';
import { ConfigService } from 'common/services/global/config';
import { PipesModule } from 'common/pipes/module';
import { NamespacedResourceService } from 'common/services/resource/resource';
import { StateService, UIRouter } from '@uirouter/core';
import { UIRouterModule } from '@uirouter/angular';
import { PodListComponent } from 'common/components/resourcelist/pod/component';

let miniName = "my-mini-service";
let maxiName = "my-maxi-service";

@Component({
    selector: 'test',
    templateUrl: './template.html'
})
class MaxiTestComponent {
    isInitialized = true;
    service: ServiceDetail = {
        objectMeta: {
            name: maxiName,
            namespace: "my-namespace",
            "labels": {
            },
            creationTimestamp: "2018-05-18T22:27:42Z"
        },
        typeMeta: {
            kind: "Service"
        },
        internalEndpoint: {
            host: "hostname",
            ports: []
        },
        externalEndpoints: [],
        endpointList: [],
        selector: {},
        type: "LoadBalancer",
        clusterIP: "10.10.10.10",
        podList: {
            pods: [
                {
                    podStatus: {
                        podPhase: "phase1",
                        status: "Ready",
                        containerStates: [
                            {
                                waiting: {
                                    reason: "Still starting"
                                }
                            }
                        ]
                    },
                    restartCount: 1,
                    metrics: {
                        cpuUsage: 10,
                        memoryUsage: 10,
                        cpuUsageHistory: [
                            {
                                timestamp: "2018-03-01T13:00:00Z",
                                value: 10
                            }
                        ],
                        memoryUsageHistory: [
                            {
                                timestamp: "2018-03-01T13:00:00Z",
                                value: 10
                            }
                        ]
                    },
                    nodeName: "Pod1",
                    objectMeta: {
                        creationTimestamp: "2018-03-01T13:00:00Z",
                        labels: {},
                        name: "metaname",
                        namespace: "my-namespace"
                    },
                    warnings: [
                        {
                            count: 2,
                            type: "event type",
                            typeMeta: {
                                kind: "Service"
                            },
                            firstSeen: "",
                            lastSeen: "",
                            message: "the event message",
                            object: "the object",
                            reason: "the reason",
                            sourceHost: "source host",
                            sourceComponent: "source component",
                            objectMeta: {
                                name: "the name",
                                namespace: "the namespace",
                                labels: {},
                                creationTimestamp: "2018-03-01T13:00:00Z"
                            }
                        }
                    ],
                    typeMeta: {
                        kind: "Service"
                    }
                }
            ],
            status: {
                failed: 2,
                pending: 1,
                running: 3,
                succeeded: 5
            },
            cumulativeMetrics: [],
            listMeta: {
                totalItems: 1
            },
            errors: [{
                ErrStatus: {
                    message: "error message",
                    code: 10,
                    status: "Ready",
                    reason: "the reason"
                }
            }]
        },
        sessionAffinity: "affinity1",
        errors: []
    }
}


fdescribe('ServiceDetailComponent', () => {

    let httpMock: HttpTestingController;
    let configService: ConfigService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MaxiTestComponent, ObjectMetaComponent, PodListComponent, CardComponent, PropertyComponent, ChipsComponent, ServiceDetailComponent
            ],
            imports: [
                MatIconModule, MatCardModule, MatDividerModule, MatTooltipModule, MatDialogModule, MatChipsModule, NoopAnimationsModule, PipesModule, HttpClientTestingModule, MatIconModule
            ],
            providers: [ConfigService, NamespacedResourceService],
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


    fit("shows a maxi service", () => {
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

