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

import {NgModule} from '@angular/core';
import {UIRouterModule} from '@uirouter/angular';
import {ComponentsModule} from '../../../common/components/module';
import {ResourceModule} from '../../../common/services/resource/module';
import {POD_ENDPOINT, REPLICA_SET_ENDPOINT, RESOURCE_ENDPOINT_DI_TOKEN} from '../../../index.config';

import {SharedModule} from '../../../shared.module';
import {ReplicaSetListComponent} from './list/component';
import {replicaSetListState} from './list/state';
import {replicaSetState} from './state';

@NgModule({
  imports: [
    SharedModule,
    ComponentsModule,
    ResourceModule,
    UIRouterModule.forChild({states: [replicaSetState, replicaSetListState]}),
  ],
  providers: [{provide: RESOURCE_ENDPOINT_DI_TOKEN, useValue: REPLICA_SET_ENDPOINT}],
  declarations: [ReplicaSetListComponent],
})
export class ReplicaSetModule {}
