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

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatButtonModule, MatCardModule, MatDividerModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatRadioModule, MatSidenavModule, MatSliderModule, MatToolbarModule, MatTooltipModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {UIRouterModule} from '@uirouter/angular';

import {PipesModule} from './common/pipes/module';

const SHARED_DEPENDENCIES = [
  // Angular imports
  CommonModule,

  // Material imports
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatGridListModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSliderModule,

  // Other 3rd party modules
  BrowserAnimationsModule,
  FlexLayoutModule,
  UIRouterModule,

  // Custom application modules
  PipesModule,
];

@NgModule({
  imports: SHARED_DEPENDENCIES,
  exports: SHARED_DEPENDENCIES,
  providers: [{
    provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
    useValue: {
      showDelay: 500,
      hideDelay: 0,
      touchendHideDelay: 0,
    }
  }],
})
export class SharedModule {}
