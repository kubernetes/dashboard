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

import {NavServiceModule} from '@common/services/nav/module';
import {SharedModule} from '../../shared.module';

import {NavComponent} from './component';
import {HamburgerComponent} from './hamburger/component';
import {NavItemComponent} from './item/component';
import {PinnerNavComponent} from './pinner/component';

@NgModule({
  declarations: [NavComponent, NavItemComponent, HamburgerComponent, PinnerNavComponent],
  exports: [NavComponent, NavItemComponent, HamburgerComponent],
  imports: [SharedModule, ComponentsModule, NavServiceModule],
})
export class NavModule {}
