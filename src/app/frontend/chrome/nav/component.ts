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

import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';

import {NavService} from '@common/services/nav/service';
import {PluginsConfigService} from '@common/services/global/plugin';

@Component({
  selector: 'kd-nav',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class NavComponent implements OnInit {
  @ViewChild(MatDrawer, {static: true}) private readonly nav_: MatDrawer;

  get isVisible(): boolean {
    return this.nav_.opened;
  }

  constructor(private readonly navService_: NavService, private readonly pluginsConfigService_: PluginsConfigService) {}

  ngOnInit(): void {
    this.navService_.setNav(this.nav_);
    this.navService_.setVisibility(true);
  }

  showPlugin(): boolean {
    return this.pluginsConfigService_.status() === 200;
  }
}
