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

// import { TestBed, ComponentFixture, async } from '@angular/core/testing';
// import { PodDetailComponent } from './component';
// import { PodDetail } from '@api/backendapi';
// import { StateService } from '@uirouter/core';
// import { NamespacedResourceService } from '../../../../common/services/resource/resource';
// import { ActionbarService } from '../../../../common/services/global/actionbar';
// import { KdStateService } from '../../../../common/services/global/state';
// import { NotificationsService } from '../../../../common/services/global/notifications';
// import { ObjectMetaComponent } from '../../../../common/components/objectmeta/component';
// import { CardComponent } from '../../../../common/components/card/component';
// import { PropertyComponent } from '../../../../common/components/property/component';
// import { ConditionListComponent } from '../../../../common/components/condition/component';
// import { CreatorCardComponent } from '../../../../common/components/creator/component';
// import { EventListComponent } from 'common/components/resourcelist/event/component';

// class MockNamespacedResourceService { };
// class MockStateService { };
// class MockKdStateService { };

// xdescribe('PodDetailComponent', () => {
//     let pod: PodDetail;

//     // class under test
//     let component: PodDetailComponent;
//     let fixture: ComponentFixture<PodDetailComponent>;

//     // constructors
//     let pod_: NamespacedResourceService<PodDetail>;
//     let actionbar_: ActionbarService;
//     // hmmm this doesn't have @Injectable
//     let state_: StateService;
//     let kdState_: KdStateService;
//     let notifications_: NotificationsService;

//     beforeEach(() => {

//         TestBed.configureTestingModule({

//             declarations: [PodDetailComponent,
//                 ObjectMetaComponent,
//                 CardComponent,
//                 PropertyComponent,
//                 ConditionListComponent,
//                 CreatorCardComponent,
//                 EventListComponent],

//             providers: [
//                 { provide: NamespacedResourceService, useClass: MockNamespacedResourceService },
//                 ActionbarService,
//                 { provide: StateService, useClass: MockStateService },
//                 { provide: KdStateService, useClass: MockKdStateService },
//                 NotificationsService

//                 // 
//                 // { provide: ActionbarService, useValue: {} },
//                 // 
//                 // 
//                 // { provide: NotificationsService, useValue: {} }
//             ]
//         }).overrideComponent(CreatorCardComponent, {
//             set: {
//                 providers: [
//                     { provide: KdStateService, useClass: MockKdStateService }
//                 ]
//             }
//         }).compileComponents();
//         fixture = TestBed.createComponent(PodDetailComponent);
//         component = fixture.componentInstance;
//         pod_ = TestBed.get(NamespacedResourceService);
//         actionbar_ = TestBed.get(ActionbarService);
//         state_ = TestBed.get(StateService);
//         kdState_ = TestBed.get(KdStateService);
//         notifications_ = TestBed.get(NotificationsService);
//     });


//     //   beforeEach(() => {
//     //     TestBed.configureTestingModule({
//     //       declarations: [
//     //         PodDetailComponent
//     //       ],
//     //       providers: [
//     //           //PodDetailComponent, 
//     //           { provide: NamespacedResourceService, useValue: {} },
//     //           { provide: ActionbarService, useValue: {} },
//     //           { provide: StateService, useValue: {} },
//     //           { provide: KdStateService, useValue: {} },
//     //           { provide: NotificationsService, useValue: {} }

//     //         //   { provide: NamespacedResourceService, useClass:MockNamespacedResourceService },
//     //         //   { provide: ActionbarService, useClass:MockActionbarService },
//     //         //   { provide: StateService, useValue: {} },
//     //         //   { provide: KdStateService, useClass:MockKdStateService },
//     //         //   { provide: NotificationsService, useClass:MockNotificationsService }
//     //       ]
//     //     }).compileComponents();


//     // // pod = {
//     //         //     init
//     //         // }

//     //   });



//     it('should create the app', async(() => {
//         // comp = TestBed.get(PodDetailComponent);
//         // pod_ = TestBed.get(NamespacedResourceService);
//         // actionbar_ = TestBed.get(ActionbarService);
//         // state_ = TestBed.get(StateService);
//         // kdState_ = TestBed.get(KdStateService);
//         // notifications_ = TestBed.get(NotificationsService);

//         expect(component).toBeTruthy();
//         //const fixture = TestBed.createComponent(PodDetailComponent);
//         //const app = fixture.debugElement.componentInstance;
//         //expect(app).toBeTruthy();
//     }));
//     //   it(`should have as title 'app'`, async(() => {
//     //     const fixture = TestBed.createComponent(PodDetailComponent);
//     //     const app = fixture.debugElement.componentInstance;
//     //     expect(app.title).toEqual('app');
//     //   }));
//     //   it('should render title in a h1 tag', async(() => {
//     //     const fixture = TestBed.createComponent(PodDetailComponent);
//     //     fixture.detectChanges();
//     //     const compiled = fixture.debugElement.nativeElement;
//     //     expect(compiled.querySelector('h1').textContent).toContain('Welcome to app!');
//     //   }));
// });