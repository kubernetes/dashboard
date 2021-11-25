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

import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {ConfigService} from '@common/services/global/config';
import {Router} from '@angular/router';
import {ResourceService} from '@common/services/resource/resource';
import {NamespaceDetail} from '@api/root.api';
import {EndpointManager, Resource} from '@common/services/resource/endpoint';
import {first} from 'rxjs/operators';
import {NavService} from '@common/services/nav/service';
import {PluginsConfigService} from '@common/services/global/plugin';

@Component({
  selector: 'kd-nav',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavComponent implements OnInit {
  @ViewChild(MatDrawer, {static: true}) private readonly nav_: MatDrawer;
  custom: boolean;
  isAdmin: boolean;
  menus;
  private readonly endpoint_ = EndpointManager.resource(Resource.namespace);
  constructor(
    private readonly navService_: NavService,
    private readonly pluginsConfigService_: PluginsConfigService,
    private readonly namespace_: ResourceService<NamespaceDetail>,
    private router: Router,
    public config: ConfigService,
  ) {}

  get isVisible(): boolean {
    return this.nav_.opened;
  }

  ngOnInit(): void {
    this.navService_.setNav(this.nav_);
    this.navService_.setVisibility(true);
    this.isAdmin_();
    this.custom = this.processjson(); //should be true
  }

  showPlugin(): boolean {
    return this.pluginsConfigService_.status() === 200;
  }

  processjson(): boolean {
    this.menus = this.config.getMenus();
    if (!this.menus) {
      return false;
    } else {
      for (const i in this.menus) {
        if (this.menus.hasOwnProperty(i)) {
          const label = this.menus[i]['label'];
          if (!label) {
            console.log('Json format error (missing menu label)');
            return false;
          } else {
            this.menus[i]['id'] = 'nav-' + label.toLowerCase();
            const links = this.menus[i]['links'];
            if (!links) {
              console.log('Json format error (menu without links)');
              return false;
            } else {
              for (const j in links) {
                if (links.hasOwnProperty(j)) {
                  if (
                    !links[j]['label'] ||
                    !links[j]['url'] ||
                    links[j]['redirect'] === undefined ||
                    typeof links[j]['redirect'] !== 'boolean'
                  ) {
                    console.log('Json format error (missing link label or url or redirect)');
                    return false;
                  } else {
                    links[j]['id'] = 'nav-' + links[j]['label'].toLowerCase();
                  }
                }
              }
            }
          }
        }
      }
    }
    return true;
  }
  goToPage(url: string) {
    this.router.navigate([`${url}`]);
  }

  isAdmin_(): void {
    this.namespace_
      .get(this.endpoint_.detail(), 'kube-system')
      .pipe(first())
      .subscribe(
        () => {
          this.isAdmin = true;
        },
        () => {
          this.isAdmin = false;
        },
        () => {},
      );
  }
}
