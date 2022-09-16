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
import {ComponentsModule} from '@common/components/module';

import {SharedModule} from '../../../shared.module';
import {CronJobDetailComponent} from './detail/component';
import {CronJobListComponent} from './list/component';
import {CronJobRoutingModule} from './routing';

@NgModule({
  imports: [SharedModule, ComponentsModule, CronJobRoutingModule],
  declarations: [CronJobListComponent, CronJobDetailComponent],
})
export class CronJobModule {}
