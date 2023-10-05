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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatLegacySliderModule as MatSliderModule} from '@angular/material/legacy-slider';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS, MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {RouterModule} from '@angular/router';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {NgPipesModule} from 'ngx-pipes';

import {PipesModule} from '@common/pipes/module';
import {KD_TOOLTIP_DEFAULT_OPTIONS} from './index.config';

const SHARED_DEPENDENCIES = [
  // Angular imports
  CommonModule,
  FormsModule,
  ReactiveFormsModule,

  // Material imports
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDividerModule,
  MatGridListModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatRadioModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule,
  MatSliderModule,
  MatDialogModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatTabsModule,
  MatMenuModule,
  MatSelectModule,
  MatButtonToggleModule,
  MatSnackBarModule,
  MatAutocompleteModule,
  MatListModule,

  // Other 3rd party modules
  FlexLayoutModule,
  RouterModule,
  NgPipesModule,
  NgxChartsModule,

  // Custom application modules
  PipesModule,
];

@NgModule({
  imports: SHARED_DEPENDENCIES,
  exports: SHARED_DEPENDENCIES,
  providers: [
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: KD_TOOLTIP_DEFAULT_OPTIONS,
    },
  ],
})
export class SharedModule {}
